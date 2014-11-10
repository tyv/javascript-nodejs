var config = require('config');
exports.get = function* (next) {

  this.locals.title = this.user.displayName;
  this.body = this.render('profile');
};

