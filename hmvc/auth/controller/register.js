var User = require('../models/user');
var jade = require('jade');
var mailer = require('mailer');
var path = require('path');
var log = require('js-log')();

// Регистрация пользователя.
exports.post = function* (next) {
  var user = new User({
    email: this.request.body.email,
    displayName: this.request.body.displayName,
    password: this.request.body.password,
    verifiedEmail: false,
    verifyEmailToken: Math.random().toString(36).slice(2),
    verifyEmailRedirect: this.request.body.verifyEmailRedirect
  });

  try {
    yield user.persist();
  } catch(e) {
    if (e.name == 'MongoError' && e.code == 11000) {
      this.status = 409;
      this.body = 'Этот email уже используется';
      return;
    }
  }

  var letter = this.render('verify-email-mail', {link: "TEST"});
  letter = mailer.inlineCss(letter);

  var result;
  try {
    yield mailer.sendMail({
      to:       user.email,
      subject: "Подтверждение email",
      html:    letter
    });

  } catch(e) {
    log.error("Registration failed: " + e);
    this.throw(500, "Ошибка отправки email");
  }

  this.status = 201;
  this.body = 'Вы зарегистрированы. Пожалуйста, загляните в почтовый ящик, там письмо с Email-подтверждением.';

};
