var passport = require('koa-passport');
var User = require('../models/user');

// Регистрация пользователя. Создаем его в базе данных, и тут же, после сохранения, вызываем метод `req.logIn`, авторизуя пользователя
exports.post = function* (next) {
  var user = new User({
    email: this.request.body.email,
    displayName: this.request.body.displayName,
    password: this.request.body.password,
    verifiedEmail: false,
    verifyEmailToken: Math.random().toString(36).slice(2)
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

//  yield this.logIn(user);

  this.status = 201;
  this.body = '';
};
