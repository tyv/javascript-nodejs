var User = require('users').User;
var jade = require('jade');
var path = require('path');
var log = require('js-log')();
var config = require('config');

// Регистрация пользователя.
exports.get = function* (next) {

  var user = yield User.findOne({
    verifyEmailToken: this.params.verifyEmailToken,
    verifiedEmail: false
  }).exec();

  if (!user) {
    this.throw(404, 'Код подтверждения недействителен или устарел.');
  }

  var redirect = user.verifyEmailRedirect;
  delete user.verifyEmailRedirect;

  user.verifiedEmail = true;
  delete user.verifyEmailTokens;

  yield user.persist();
  yield this.login(user);

  this.redirect(redirect);
};
