var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');
var sendMail = require('sendMail');

// Регистрация пользователя.
exports.post = function* (next) {

//  yield function(callback) {};

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

    yield sendMail({
      templatePath: path.join(this.templateDir, 'verify-registration-email'),
      to: user.email,
      subject: "Подтверждение email",
      link: config.server.siteHost + '/auth/verify/' + verifyEmailToken
    });

  } catch(e) {
    this.log.error({err: e}, "Registration failed" );
    this.throw(500, "Ошибка отправки email.");
  }

  try {
    yield user.persist();
  } catch(e) {
    if (e.name == 'ValidationError') {
      try {
        if (e.errors.email.type == "notunique") {
          e.errors.email.message += ' Если он ваш, то можно <a data-switch="login-form" href="#">войти</a> или <a data-switch="forgot-form" href="#">восстановить пароль</a>.';
        }
      } catch (ex) { /* e.errors.email is undefined, that's ok */ }
      this.renderError(e);
      return;
    } else {
      this.throw(e);
    }
  }

  this.status = 201;
  this.body = ''; //Вы зарегистрированы. Пожалуйста, загляните в почтовый ящик, там письмо с Email-подтверждением.';

};
