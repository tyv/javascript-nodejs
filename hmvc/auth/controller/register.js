var User = require('../models/user');
var jade = require('jade');
var sendVerifyEmail  = require('../lib/sendVerifyEmail');
var path = require('path');
var log = require('js-log')();
var config = require('config');

// Регистрация пользователя.
exports.post = function* (next) {

  var verifyEmailToken = Math.random().toString(36).slice(2, 10);
  var user = new User({
    email: this.request.body.email,
    displayName: this.request.body.displayName,
    password: this.request.body.password,
    verifiedEmail: false,
    verifyEmailToken: verifyEmailToken,
    verifyEmailRedirect: this.request.body.successRedirect
  });

  try {
    yield user.persist();
  } catch(e) {
    if (e.name == 'MongoError' && e.code == 11000) {
      this.status = 409;
      var existingUser = yield User.findOne({email: this.request.body.email}).exec();
      if (existingUser.verifiedEmail) {
        this.body = 'Этот email уже используется.';
      } else {
        this.body = 'Такой пользователь зарегистрирован, но его Email не подтверждён, можно <a href="#" data-action-verify-email="' + existingUser.email + '">запросить подтверждение заново</a>.';
      }
      return;
    }
  }

  try {
    yield* sendVerifyEmail(user.email, verifyEmailToken, this);
  } catch(e) {
    log.error("Registration failed: " + e);
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.status = 201;
  this.body = ''; //Вы зарегистрированы. Пожалуйста, загляните в почтовый ящик, там письмо с Email-подтверждением.';

};
