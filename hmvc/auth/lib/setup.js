const passport = require('koa-passport');
const User = require('../models/user');
const config = require('config');
const co = require('co');
const log = require('js-log')();

// setup auth strategy
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(require('./../strategies/localStrategy'));

passport.use(require('./../strategies/facebookStrategy'));
passport.use(require('./../strategies/googleStrategy'));
passport.use(require('./../strategies/yandexStrategy'));
passport.use(require('./../strategies/githubStrategy'));
