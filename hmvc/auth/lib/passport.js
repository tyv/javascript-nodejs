const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// setup auth strategy
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {

  if (!email) return done(null, false, { message: 'Укажите email.' });
  if (!password) return done(null, false, { message: 'Укажите пароль.' });
  User.findOne({email: email}, function(err, user) {
    //console.log(email, password, err, user);

    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Нет пользователя с таким email.' });
    return user.checkPassword(password) ? done(null, user) :
      done(null, false, { message: 'Пароль неверен.' });
  });
}));
