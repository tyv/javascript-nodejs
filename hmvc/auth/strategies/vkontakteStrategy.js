const User = require('../models/user');
const VkontakteStrategy = require('passport-vkontakte').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

module.exports = new VkontakteStrategy({
    clientID: config.auth.vkontakte.appId,
    clientSecret: config.auth.vkontakte.appSecret,
    callbackURL: config.siteurl + "/auth/callback/vkontakte",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, oauthResponse, profile, done) {

    if (!oauthResponse.email) {
      return done(null, false, "Просьба разрешить доступ к email для авторизации. Он будет скрыт от просмотра");
    }

    profile.emails = [{value: oauthResponse.email}];

    authenticateByProfile(profile, done);
  }

);

