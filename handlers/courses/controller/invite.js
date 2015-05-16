const Course = require('../models/course');
const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const _ = require('lodash');

const LOGIN_SUCCESSFUL = 1;
const LOGGED_IN_ALREADY = 2;
const NO_SUCH_USER = 3;

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
    this.body = this.render("invite/accepted");
    return;
  }

  // invite is also a login token, so we limit it's validity
  if (invite.validUntil < Date.now()) {
    this.body = this.render("invite/outdated");
    return;
  }

  yield CourseGroup.populate(invite.group, {path: 'participants.user'});

  // invite was NOT accepted, but this guy is a participant,
  // so show the same as accepted
  var participantsByEmail = _.indexBy(_.pluck(invite.group.participants, 'user'), 'email');

  if (participantsByEmail[invite.email]) {
    this.body = this.render("invite/accepted");
    return;
  }

  // invalid invite, person not in list
  if (!~invite.order.data.emails.indexOf(invite.email)) {
    this.body = this.render('invite/deny', {
      email: invite.email,
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

  if (this.method == 'POST') {
    yield acceptParticipant.call(this, invite);
  } else {

    this.locals.title = "Анкета участника\n" + invite.group.title;

    this.body = this.render('invite/askParticipantDetails', {
      errors: {},
      form: {}
    });
  }

}


function* register(invite) {

  if (this.method == 'POST') {

    // do register the man, email is verified
    var user = new User({
      email: invite.email,
      displayName: this.request.body.displayName,
      password: this.request.body.password,
      verifiedEmail: true
    });

    try {
      yield user.persist();
    } catch(e) {
      var errors = {};
      for (var key in e.errors) {
        errors[key] = e.errors[key].message;
      }

      this.body = this.render('invite/register', {
        errors: e.errors,
        form: {
          displayName: this.request.body.displayName,
          password: this.request.body.password
        }
      });
      return;
    }

    yield this.login(user);

    this.redirect('/courses/invite/' + invite.token);

  } else {
    this.body = this.render('invite/register', {
      errors: {},
      form: {}
    });
  }
}

function* acceptParticipant(invite) {
  invite.group.participants.push({
    user: this.user._id,
    courseName: this.request.body.courseName || this.user.displayName
  });

  // esp. important for newly regged users, they don't have this tab by default or invite
  this.user.profileTabsEnabled.addToSet('courses');
  yield this.user.persist();

  yield invite.accept();

  invite.group.decreaseParticipantsLimit();

  yield invite.group.persist();
  this.redirect('/courses/invite/' + invite.token);
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
