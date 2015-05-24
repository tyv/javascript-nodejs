const Course = require('../models/course');
const CourseInvite = require('../models/courseInvite');
const config = require('config');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const VideoKey = require('videoKey').VideoKey;
const _ = require('lodash');
const countries = require('countries');
const LOGIN_SUCCESSFUL = 1;
const LOGGED_IN_ALREADY = 2;
const NO_SUCH_USER = 3;
const CourseParticipant = require('../models/courseParticipant');
const ImgurImage = require('imgur').ImgurImage;
const log = require('log')();
const xmppClient = require('xmppClient');


exports.all = function*() {

  if (this.method != 'POST' && this.method != 'GET') {
    this.throw(404);
  }

  var invite = yield CourseInvite.findOne({
    token: this.params.inviteToken || this.request.body && this.request.body.inviteToken
  }).populate('group').populate('order').exec();

  this.locals.mailto = "mailto:orders@javascript.ru";
  if (invite.order) this.locals.mailto += "?subject=" + encodeURIComponent('Заказ ' + invite.order.number);

  if (!invite) {
    this.throw(404);
  }

  if (invite.accepted) {
    this.addFlashMessage("success", "Поздравляем, вы присоединились к курсу. Ниже рядом с курсом вы найдёте полезные ссылки, включая инструкцию.");
    this.redirect(this.user.getProfileUrl() + '/courses');
    return;
  }

  // invite is also a login token, so we limit it's validity
  if (invite.validUntil < Date.now()) {
    this.body = this.render("invite/outdated");
    return;
  }

  yield CourseGroup.populate(invite.group, {path: 'participants.user'});

  var participantsByEmail = _.indexBy(_.pluck(invite.group.participants, 'user'), 'email');
  // invite was NOT accepted, but this guy is a participant (added manually?),
  // so show the same as accepted
  if (participantsByEmail[invite.email]) {
    this.addFlashMessage("success", "Вы уже участник курса. Ниже рядом с курсом вы найдёте полезные ссылки, включая инструкцию.");
    this.redirect(this.user.getProfileUrl() + '/courses');
    return;
  }

  // invalid invite, person not in list
  if (!~invite.order.data.emails.indexOf(invite.email)) {
    this.body = this.render('invite/deny', {
      email:       invite.email,
      contactName: invite.order.data.contactName,
      orderNumber: invite.order.number
    });

    return;
  }

  // ----------- INVITE IS VALID ----------------

  this.locals.title = invite.group.title;
  this.locals.invite = invite;

  var isLoggedIn = yield* loginByInvite.call(this, invite);

  if (isLoggedIn == NO_SUCH_USER) {
    if (this.user) this.logout();
    yield* register.call(this, invite);

  } else {
    if (isLoggedIn == LOGIN_SUCCESSFUL) {
      this.locals.wasLoggedIn = true;
    }
    yield* askParticipantDetails.call(this, invite);
  }

};

function* askParticipantDetails(invite) {

  // NB: this.user is the right user, guaranteed by loginByInvite

  var selectCountries = Object.create(countries.all);
  selectCountries[""] = {
    "co": "",
    "ph": "",
    "na": " выберите страну "
  };

  this.locals.title = "Анкета участника\n" + invite.group.title;
  this.locals.countries = selectCountries;

  if (this.method == 'POST') {
    var participantData = _.clone(this.request.body);
    participantData.user = this.user;

    if (participantData.photoId) {
      var photo = yield ImgurImage.findOne({imgurId: this.request.body.photoId}).exec();
      participantData.photo = photo.link;
    } else {
      participantData.photo = this.user.getPhotoUrl();
    }

    var participant = new CourseParticipant(participantData);


    try {
      yield participant.validate();
    } catch (e) {
      var errors = {};
      for (var key in e.errors) {
        errors[key] = e.errors[key].message;
      }

      this.body = this.render('invite/askParticipantDetails', {
        errors: errors,
        form:   participantData
      });

      return;
    }

    this.log.debug(participant.toObject(), "participant is accepted");

    yield* acceptParticipant.call(this, invite, participant);

    // will show "welcome" cause the invite is accepted
    this.redirect('/courses/invite/' + invite.token);


  } else {

    this.body = this.render('invite/askParticipantDetails', {
      errors: {},
      form:   {
        photo:   this.user.getPhotoUrl(),
        country: 'ru'
      }
    });

  }

}

function* acceptParticipant(invite, participant) {

  invite.group.participants.push(participant);

  this.user.profileTabsEnabled.addToSet('courses');
  yield this.user.persist();

  yield invite.accept();

  invite.group.decreaseParticipantsLimit();

  yield invite.group.persist();


  yield CourseGroup.populate(invite.group, [{path: 'participants.user'}, {path: 'course'}]);

  if (process.env.NODE_ENV != 'development') {
    yield* grantXmppChatMemberships(invite.group);
  }

  if (invite.group.course.videoKeyTag) {
    yield *grantVideoKeys(invite.group);
  }


}


function* register(invite) {

  if (this.method == 'POST') {

    // do register the man, email is verified
    var user = new User({
      email:         invite.email,
      displayName:   this.request.body.displayName,
      password:      this.request.body.password,
      verifiedEmail: true
    });

    try {
      yield user.persist();
    } catch (e) {
      var errors = {};
      for (var key in e.errors) {
        errors[key] = e.errors[key].message;
      }

      this.body = this.render('invite/register', {
        errors: e.errors,
        form:   {
          displayName: this.request.body.displayName,
          password:    this.request.body.password
        }
      });
      return;
    }

    yield this.login(user);

    this.redirect('/courses/invite/' + invite.token);

  } else {
    this.body = this.render('invite/register', {
      errors: {},
      form:   {}
    });
  }
}

/**
 * Logs in the current user using invite data
 * Makes email verified
 * @param invite
 * @returns LOGIN_SUCCESSFUL / NO_SUCH_USER / LOGGED_IN_ALREADY
 */
function* loginByInvite(invite) {

  if (this.user && this.user.email == invite.email) {
    return LOGGED_IN_ALREADY;
  }

  var userByEmail = yield User.findOne({
    email: invite.email
  }).exec();

  if (!userByEmail) return NO_SUCH_USER;

  if (!userByEmail.verifiedEmail) {
    // if pending verification => invite token confirms email
    yield userByEmail.persist({
      verifiedEmail: true
    });
  }

  yield this.login(userByEmail);
  return LOGIN_SUCCESSFUL;
}


function* grantXmppChatMemberships(group) {
  log.debug("Grant xmpp chat membership");
  // grant membership in chat
  var client = new xmppClient({
    jid:      config.xmpp.admin.login + '/host',
    password: config.xmpp.admin.password
  });

  yield client.connect();

  var roomJid = yield client.createRoom({
    roomName:    group.webinarId,
    membersOnly: 1
  });


  var jobs = [];
  for (var i = 0; i < group.participants.length; i++) {
    var participant = group.participants[i];

    log.debug("grant " + roomJid + " to", participant.user.profileName, participant.firstName, participant.surname);

    jobs.push(client.grantMember(roomJid, participant.user.profileName,  participant.firstName + ' ' + participant.surname));
  }

  // grant all in parallel
  yield jobs;

  client.disconnect();
}

function* grantVideoKeys(group) {

  var participants = group.participants.filter(function(participant) {
    return !participant.videoKey;
  });

  var videoKeys = yield VideoKey.find({
    tag: group.course.videoKeyTag,
    used: false
  }).limit(participants.length).exec();

  log.debug("Keys selected", videoKeys && videoKeys.toArray());

  if (!videoKeys || videoKeys.length != participants.length) {
    throw new Error("Недостаточно серийных номеров " + participants.length);
  }

  for (var i = 0; i < participants.length; i++) {
    var participant = participants[i];
    participant.videoKey = videoKeys[i].key;
    videoKeys[i].used = true;
  }

  yield group.persist();

  var jobs = videoKeys.map(function(videoKey) {
    return videoKey.persist();
  });
  yield jobs;
}
