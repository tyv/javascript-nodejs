var config = require('config');
var User = require('users').User;
var mongoose = require('mongoose');

// skips the request unless it's the owner
exports.get = function* (next) {

  if (!this.user) {
    yield* next;
    return;
  }

  var user = yield User.findOne({profileName: this.params.profileName}).exec();

  if (!user) {
    this.throw(404);
  }

  // if the visitor is the profile owner
  if (String(this.user._id) == String(user._id)) {

    this.locals.title = this.user.displayName;

    this.body = this.render('index');
  } else {
    yield* next;
  }

};

