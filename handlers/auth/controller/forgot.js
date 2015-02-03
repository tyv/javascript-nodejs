var User = require('users').User;
var jade = require('jade');
var sendForgotEmail  = require('../lib/sendForgotEmail');
var path = require('path');
var config = require('config');

exports.post = function* (next) {

  var user = yield User.findOne({
    email: this.request.body.email
  }).exec();

  if (!user) {
    this.status = 404;
    this.body = 'Нет такого пользователя.';
    return;
  }

  user.passwordResetToken = Math.random().toString(36).slice(2, 10);
  user.passwordResetTokenExpires = new Date(Date.now() + 86400*1e3);
  user.passwordResetRedirect = this.request.body.successRedirect;

  yield user.persist();

  try {
    yield* sendForgotEmail(user.email, user.passwordResetToken, this);
  } catch(e) {
    this.log.error({err: e}, "Mail send failed");
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.status = 200;
  this.body = 'На вашу почту отправлено письмо со ссылкой на смену пароля.';

};
