const User = require('../models/user');
const YandexStrategy = require('passport-yandex').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

module.exports = new YandexStrategy({
    clientID: config.auth.yandex.appId,
    clientSecret: config.auth.yandex.appSecret,
    callbackURL: config.siteurl + "/auth/callback/yandex"
  },
  function(accessToken, refreshToken, profile, done) {
    authenticateByProfile(profile, done);
  }
);

