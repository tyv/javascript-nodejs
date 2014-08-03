const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');

module.exports = new GoogleStrategy({
    consumerKey: config.auth.google.appId,
    consumerSecret: config.auth.google.appSecret,
    callbackURL: config.siteurl + "/auth/callback/google"
  },
  function(token, tokenSecret, profile, done) {
    console.log(arguments);
  }
);
