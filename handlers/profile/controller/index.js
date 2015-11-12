var config = require('config');
var User = require('users').User;

// skips the request unless it's the owner
exports.get = function* (next) {

  if (!this.user) {
    yield* next;
    return;
  }

  // /profile -> /profile/iliakan
  if (!this.params.profileName) {
    this.status = 301;
    this.redirect(`/profile/${this.user.profileName}`);
    return;
  }

  var user = yield User.findOne({profileName: this.params.profileName});

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

