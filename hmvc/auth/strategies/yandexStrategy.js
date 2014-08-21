const User = require('../models/user');
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
    clientID:          config.auth.yandex.appId,
    clientSecret:      config.auth.yandex.appSecret,
    callbackURL:       config.siteurl + "/auth/callback/yandex",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    authenticateByProfile(profile, done);
  }
);

