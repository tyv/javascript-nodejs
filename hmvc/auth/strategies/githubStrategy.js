const User = require('../models/user');
const GithubStrategy = require('passport-github').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');
const request = require('request');
const log = require('js-log')();

module.exports = new GithubStrategy({
    clientID:     config.auth.github.appId,
    clientSecret: config.auth.github.appSecret,
    callbackURL:  config.siteurl + "/auth/callback/github"
  },
  function(accessToken, refreshToken, profile, done) {

    var options = {
      headers: {
        'User-Agent':    'JavaScript.ru',
        'Authorization': 'token ' + accessToken
      },
      json: true,
      url:     'https://api.github.com/user/emails'
    };

    // get emails using oauth token
    request(options, function(error, response, body) {
      if (error || response.statusCode != 200) {
        log.error(error.message);
        log.error(body);
        done(null, false, "Ошибка связи с сервером github");
        return;
      }

//      [ { email: 'iliakan@gmail.com', primary: true, verified: true } ],

      var emails = body.filter(function(email) {
        return email.verified;
      });

      if (!emails.length) {
        return done(null, false, "Почта на github должна быть подтверждена");
      }

      profile.emails = [
        {value: emails[0].email }
      ];

      console.log(profile);
      authenticateByProfile(profile, done);
    });


  }
);
