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

    // Vkontakte gives email in oauthResponse, not in profile (which is 1 more request)
    if (!oauthResponse.email) {
      return done(null, false, {message: "Для захода на сайт необходим email. Он будет скрыт от внешнего просмотра."});
    }

    profile.emails = [{value: oauthResponse.email}];

    authenticateByProfile(profile, done);
  }

);

