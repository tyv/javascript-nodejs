const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {

  if (!email) return done(null, false, 'Укажите email.');
  if (!password) return done(null, false, 'Укажите пароль.');
  User.findOne({email: email}, function(err, user) {
    //console.log(email, password, err, user);

    if (err) return done(err); // db error

    if (!user) {
      return done(null, false, 'Нет пользователя с таким email.');
    }

    if (!user.checkPassword(password)) {
      return done(null, false, 'Пароль неверен.');
    }

    if (!user.verifiedEmail) {
      return done(null, false, 'Email не подтверждён, <a href="#" data-action-verify-email="' + email + '">запросить подтверждение</a>' );
    }

    done(null, user);
  });
});
