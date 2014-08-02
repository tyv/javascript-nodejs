const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const config = require('config');
const co = require('co');

// setup auth strategy
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
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

passport.use(new FacebookStrategy({
    clientID:          config.auth.facebook.appId,
    clientSecret:      config.auth.facebook.appSecret,
    callbackURL:       config.siteurl + "/auth/callback/facebook",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    // profile = the data returned by the facebook graph api

    console.log("HERE!!!");
    console.log(arguments);

    /*
    co(function*() {
      var user = yield User.findById(profile.id).exec();


    })(done);
*/
  }
));
