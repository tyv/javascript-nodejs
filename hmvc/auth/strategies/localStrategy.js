const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const co = require('co');

// done(null, user)
// OR
// done(null, false, { message: <error message> })  <- 3rd arg format is from built-in messages of strategies
module.exports = new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password'
}, function(login, password, done) {

  if (!login) return done(null, false, {message: 'Укажите имя пользователя или email.'});
  if (!password) return done(null, false, {message: 'Укажите пароль.'});

  co(function*() {

    var user = yield User.findOne({email: login}).exec();
    if (!user) {
      user = yield User.findOne({displayName: login}).exec();
    }

    if (!user) {

      return done(null, false, {message: 'Нет такого пользователя.'});
    }

    if (!user.checkPassword(password)) {
      return done(null, false, {message: 'Пароль неверен.'});
    }

    if (!user.verifiedEmail) {
      return done(null, false, {message: 'Email не подтверждён, можно <a href="#" data-action-verify-email="' + user._id + '">запросить подтверждение</a>'});
    }

    done(null, user);
  })(function(err) {
    if (err) done(err);
  });

});
