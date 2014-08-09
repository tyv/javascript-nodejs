const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');

// WORKS.
module.exports = new FacebookStrategy({
    clientID:          config.auth.facebook.appId,
    clientSecret:      config.auth.facebook.appSecret,
    callbackURL:       config.siteurl + "/auth/callback/facebook",
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

    authenticateByProfile(profile, done);
  }
);
