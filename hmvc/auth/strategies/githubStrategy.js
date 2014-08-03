const User = require('../models/user');
const GithubStrategy = require('passport-github').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');

module.exports = new GithubStrategy({
    clientID: config.auth.github.appId,
    clientSecret: config.auth.github.appSecret,
    callbackURL: config.siteurl + "/auth/callback/github"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(arguments);
  }
);
