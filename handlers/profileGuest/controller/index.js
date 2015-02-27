var config = require('config');
var User = require('users').User;
var mongoose = require('mongoose');

// skips the request if it's the owner
exports.get = function* (next) {

  var user = yield User.findByProfileName(this.params.profileName).exec();

  if (!user) {
    this.throw(404);
  }

  // the owner => another middleware
  if (this.user && String(this.user._id) == String(user._id)) {
    yield* next;
    return;
  }

  this.locals.title = user.displayName;

  this.body = this.render('index', {
    profileUser: user
  });

};

