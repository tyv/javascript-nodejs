const Course = require('../models/course');
const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const _ = require('lodash');

exports.all = function*() {
/*
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

  if (invite.validUntil < Date.now()) {
    this.body = this.render("invite/outdated");
    return;
  }

  yield CourseGroup.populate(invite.group, {path: 'participants.user'});

  // invite was NOT accepted, but this guy is a participant,
  // so show same as accepted
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

  // logged in user is invited, no need to enter anything
  if (this.user && this.user.email == invite.email) {
    yield* invite.accept();
    this.redirect(this.user.getProfileUrl() + '/courses');
    return;
  }

  this.locals.title = "Подтверждение регистрации на курс " + invite.group.title;
  this.locals.invite = invite;

  var userByEmail = yield User.findOne({
    email: invite.email
  }).exec();

  // if no user => register
  // if user exists => make sure he has password (need for jabber)

  var state;
  // not registered user
  if (!userByEmail) {
    state = 'NEW_USER';
  } else if (user.em{


    if (this.method == 'POST') {

      // do register the man, email is verified
      var user = new User({
        email: invite.email,
        displayName: this.request.body.displayName,
        password: this.request.body.newPassword,
        verifiedEmail: true
      });

      try {
        yield user.persist();
        this.redirect('/courses/invite/' + invite.token);
        return;
      } catch(e) {
        var errors = {};
        for (var key in e.errors) {
          errors[key] = e.errors[key].message;
        }
        this.body = this.render('invite/register', {
          message: 'Для подтверждения вам необходимо зарегистрироваться.',
          errors: e.errors,
          newUser: true,
          form: {
            displayName: this.request.body.displayName,
            fio: this.request.body.fio,
            newPassword: this.request.body.newPassword
          }
        });
      }


    } else {
      this.body = this.render('invite/register', {
        message: 'Для подтверждения вам необходимо зарегистрироваться.',
        newUser: true,
        form: {
          displayName: '',
          fio: '',
          newPassword: ''
        }
      });
      return;
    }
  }



  this.body = "OK";*/
};
