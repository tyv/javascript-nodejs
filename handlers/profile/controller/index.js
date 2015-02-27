var config = require('config');
var User = require('users').User;
var mongoose = require('mongoose');

// skips the request unless it's the owner
exports.get = function* (next) {

  if (!this.user) {
    yield* next;
    return;
  }

  var user = yield User.findByProfileName(this.params.profileName).exec();

  if (!user) {
    this.throw(404);
  }

  if (user.profileName && this.params.profileName != user.profileName) {
    // access by id
    // for a user with profileName => redirect to the new profile url
    this.redirect(user.getProfileUrl());
    return;
  }

  if (String(this.user._id) == String(user._id)) {

    this.locals.title = this.user.displayName;

    this.body = this.render('index');
  } else {
    yield* next;
  }

};

