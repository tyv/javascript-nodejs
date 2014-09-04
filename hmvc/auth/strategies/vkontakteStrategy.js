var User = require('users').User;
const VkontakteStrategy = require('passport-vkontakte').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

/*
result:
{ id: 1818925,
  first_name:      'Юля',
  last_name:       'Дубовик',
  sex:             1,
  screen_name:     'id1818925',
  photo:           'http://cs5475.vk.me/u1818925/e_974b5ece.jpg'
}
(email in oauthResponse)
*/

module.exports = new VkontakteStrategy({
    clientID:          config.authProviders.vkontakte.appId,
    clientSecret:      config.authProviders.vkontakte.appSecret,
    callbackURL:       config.siteurl + "/auth/callback/vkontakte",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, oauthResponse, profile, done) {

    // Vkontakte gives email in oauthResponse, not in profile (which is 1 more request)
    if (!oauthResponse.email) {
      return done(null, false, {message: "Для захода на сайт необходим email. Он будет скрыт от внешнего просмотра."});
    }


    profile.emails = [
      {value: oauthResponse.email}
    ];

    console.log(profile);

    authenticateByProfile(req, profile, done);
  }
);

