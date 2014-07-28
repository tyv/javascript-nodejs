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
  console.log("!!!!", email, password);

  if (!email) return done(null, false, { message: 'Please provide email.' });
  if (!password) return done(null, false, { message: 'Please provide password.' });
  User.findOne({email: email}, function(err, user) {
    console.log(email, password, err, user);

    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Non-registered email.' });
    return user.checkPassword(password)
      ? done(null, user)
      : done(null, false, { message: 'Incorrect password.' });
  });
}));
