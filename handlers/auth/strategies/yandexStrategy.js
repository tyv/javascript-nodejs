var User = require('users').User;
const YandexStrategy = require('passport-yandex').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

/*
{
  provider:    'yandex',
  id:          '73404',
  username:    'nlpstudent',
  displayName: 'nlpstudent',
  name:        { familyName: 'Ilia', givenName: 'Kantor' },
  gender:      'male',
  emails:      [
    [Object]
  ],
  _raw:        '{"first_name": "Ilia", "last_name": "Kantor", "display_name": "nlpstudent", "emails": ["nlpstudent@yandex.ru"], "default_email": "nlpstudent@yandex.ru", "real_name": "Ilia Kantor", "login": "nlpstudent", "sex": "male", "id": "73404"}',
  _json:       { first_name: 'Ilia',
    last_name:               'Kantor',
    display_name:            'nlpstudent',
    emails:                  [Object],
    default_email:           'nlpstudent@yandex.ru',
    real_name:               'Ilia Kantor',
    login:                   'nlpstudent',
    sex:                     'male',
    id:                      '73404'
  }
}
// No avatar here :(
*/

module.exports = new YandexStrategy({
    clientID:          config.authProviders.yandex.appId,
    clientSecret:      config.authProviders.yandex.appSecret,
    callbackURL:       config.server.siteHost + "/auth/callback/yandex",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    /* jshint -W106 */
    profile.realName = profile._json.real_name;

    authenticateByProfile(req, profile, done);
  }
);

