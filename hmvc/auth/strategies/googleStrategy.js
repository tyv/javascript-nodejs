const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const GooglePlusStrategy = require('passport-google-plus');
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');

// Doesn't work: error when denied access,
// maybe https://www.npmjs.org/package/passport-google-plus ?
// should not require G+
module.exports = new GoogleStrategy({
    consumerKey: config.auth.google.appId,
    consumerSecret: config.auth.google.appSecret,
    callbackURL: config.siteurl + "/auth/callback/google"
  },
  function(token, tokenSecret, profile, done) {
    console.log(arguments);
  }
);


/*


 // revoke permission: https://security.google.com/settings/security/permissions?pli=1
 module.exports = new GooglePlusStrategy({
 clientId: config.auth.google.appId,
 clientSecret: config.auth.google.appSecret,
 callbackURL: config.siteurl + "/auth/callback/google"
 },
 function(token, tokenSecret, profile, done) {
 console.log(arguments);
 }
 );

 */
