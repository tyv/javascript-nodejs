const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {

  if (!email) return done(null, false, { message: 'Укажите email.' });
  if (!password) return done(null, false, { message: 'Укажите пароль.' });
  User.findOne({email: email}, function(err, user) {
    //console.log(email, password, err, user);

    if (err) return done(err); // db error

    if (!user) {
      return done(null, false, { message: 'Нет пользователя с таким email.' });
    }

    if (!user.checkPassword(password)) {
      return done(null, false, { message: 'Пароль неверен.' });
    }

    if (!user.verifiedEmail) {
      return done(null, false, { message: 'Email не подтверждён, <a href="#" data-action-verify-email="' + email + '">запросить подтверждение</a>'} );
    }
  });
});
