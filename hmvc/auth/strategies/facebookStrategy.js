const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');
const request = require('request');

/*
 Returns fields:
{
  "id": "765813916814019",
  "email": "nlpstudent\u0040mail.ru",
  "gender": "male",
  "link": "https:\/\/www.facebook.com\/app_scoped_user_id\/765813916814019\/",
  "locale": "ru_RU",
  "timezone": 4,
  "verified": true,
  "name": "Ilya Kantor",
  "last_name": "Kantor",
  "first_name": "Ilya"
}

 If I add "picture" to profileURL?fields, I get a *small* picture.

 Real picture is (public):
 (76581...19 is user id)
 http://graph.facebook.com/v2.1/765813916814019/picture?redirect=0&width=1000&height=1000

 redirect=0 means to get meta info, not picture
 then check is_silhouette (if true, no avatar)

 then if is_silhouette = false, go URL
 (P.S. width/height are unreliable, not sure which exactly size we get)

*/

module.exports = new FacebookStrategy({
    clientID:          config.auth.facebook.appId,
    clientSecret:      config.auth.facebook.appSecret,
    callbackURL:       config.siteurl + "/auth/callback/facebook",
    // fields are described here:
    // https://developers.facebook.com/docs/graph-api/reference/v2.1/user
    profileURL:        'https://graph.facebook.com/me?fields=id,about,email,gender,link,locale,timezone,verified,name,last_name,first_name,middle_name',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    // req example:
    // '/callback/facebook?code=...',

    // accessToken:
    // ... (from ?code)

    // refreshToken:
    // undefined

    // we really want verified emails from facebook
    // if not, someone may login with facebook using unverified email,
    // impersonating another user, and we'll let him in :/
    if (!profile._json.verified) {
      return done(null, false, {message: "Почта на facebook должна быть подтверждена"});
    }

    request.get({
      url: 'http://graph.facebook.com/v2.1/' + profile.id + '/picture?redirect=0&width=1000&height=1000',
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        /* jshint -W106 */
        if (!body.data.is_silhouette) {
          profile.photos = [body.data.url];
        }

      }
      authenticateByProfile(profile, done);
    });

//    http://graph.facebook.com/v2.1/765813916814019/picture?redirect=0&width=1000&height=1000


  }
);
