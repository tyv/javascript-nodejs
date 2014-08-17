var User = require('../models/user');
var jade = require('jade');
var path = require('path');
var log = require('js-log')();
var config = require('config');

// Регистрация пользователя.
exports.get = function* (next) {

  var passwordResetToken = this.params.passwordResetToken;

  var user = yield User.findOne({
    passwordResetToken:        passwordResetToken,
    passwordResetTokenExpires: {
      $gt: new Date()
    }
  }).exec();

  if (!user) {
    this.throw(404, 'Вы перешли по устаревшей или недействительной ссылке на восстановление.');
  }

  this.body = this.render('forgot-recover', {
    passwordResetToken: passwordResetToken
  });

};

exports.post = function* (next) {

  var passwordResetToken = this.request.body.passwordResetToken;

  var user = yield User.findOne({
    passwordResetToken:        passwordResetToken,
    passwordResetTokenExpires: {
      $gt: new Date()
    }
  }).exec();

  if (!user) {
    this.throw(404, 'Ваша ссылка на восстановление недействительна или устарела.');
  }

  if (!this.request.body.password) {

    this.body = this.render('forgot-recover', {
      passwordResetToken: passwordResetToken,
      error: "Пароль не должен быть пустым."
    });

    return;
  }

  var redirect = user.passwordResetRedirect;

  delete user.passwordResetToken;
  delete user.passwordResetTokenExpires;
  delete user.passwordResetRedirect;

  user.password = this.request.body.password;

  yield user.persist();

  yield this.login(user);

  this.redirect(redirect);
};
