var User = require('users').User;
var jade = require('jade');
var path = require('path');
var config = require('config');
var sendVerifyEmail  = require('../lib/sendVerifyEmail');

// Регистрация пользователя.
exports.post = function* (next) {

  var email = this.request.body.email;
  if (!email) {
    this.throw(404, 'Не указан email пользователя.');
  }

  var user = yield User.findOne({
    email: email
  }).exec();

  if (!user) {
    this.throw(404, 'Нет такого пользователя.');
  }

  if (user.verifiedEmail) {
    this.throw(403, 'Ваш Email уже подтверждён.');
  }

  try {
    yield* sendVerifyEmail(user.email, user.verifyEmailToken, this);
  } catch(e) {
    this.log.error({err: e}, "Reverify failed");
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.body = '';
};
