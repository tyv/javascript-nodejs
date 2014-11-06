var User = require('users').User;
const FacebookStrategy = require('passport-facebook').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');
const request = require('koa-request');
const co = require('co');

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
    clientID:          config.authProviders.facebook.appId,
    clientSecret:      config.authProviders.facebook.appSecret,
    callbackURL:       config.siteHost + "/auth/callback/facebook",
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

    // I guess, facebook won't allow to use an email w/o verification, but still...
    if (!profile._json.verified) {
      return done(null, false, {message: "Почта на facebook должна быть подтверждена"});
    }

    co(function*() {

      var response = yield request.get({
        url: 'http://graph.facebook.com/v2.1/' + profile.id + '/picture?redirect=0&width=1000&height=1000',
        json: true
      });

      if (response.statusCode != 200) {
        done(null, false, {message: "Ошибка в запросе к Facebook"});
        return;
      }

      var photoData = response.body.data;
      /* jshint -W106 */
      profile.photos = [{
        value: photoData.url,
        type: photoData.is_silhouette ? 'default' : 'photo'
      }];


    })(function(err) {
      if (err) return done(err);
      authenticateByProfile(req, profile, done);
    });

//    http://graph.facebook.com/v2.1/765813916814019/picture?redirect=0&width=1000&height=1000


  }
);
