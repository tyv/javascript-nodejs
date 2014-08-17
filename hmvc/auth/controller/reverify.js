var User = require('../models/user');
var jade = require('jade');
var path = require('path');
var log = require('js-log')();
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


  var verifyEmailToken = Math.random().toString(36).slice(2);
  user.verifyEmailTokens.push(verifyEmailToken);
  yield user.persist();

  try {
    yield* sendVerifyEmail(user.email, verifyEmailToken, this);
  } catch(e) {
    log.error("Registration failed: " + e);
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.body = '';
};
