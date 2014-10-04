const passport = require('koa-passport');
const User = require('users').User;
const config = require('config');
const co = require('co');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// setup auth strategy
passport.serializeUser(function(user, done) {
  done(null, user.id); // uses _id as idFiel // uses _id as idFieldd
});

passport.deserializeUser(function(id, done) {
  try {
    id = mongoose.Types.ObjectId(id);
  } catch(e) { // CastError = not found
    return done(null, null);
  }

  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(require('./../strategies/localStrategy'));

passport.use(require('./../strategies/facebookStrategy'));
passport.use(require('./../strategies/googleStrategy'));
passport.use(require('./../strategies/yandexStrategy'));
passport.use(require('./../strategies/githubStrategy'));
passport.use(require('./../strategies/vkontakteStrategy'));
