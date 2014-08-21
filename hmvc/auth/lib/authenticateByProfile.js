const User = require('../models/user');
const config = require('config');
const co = require('co');
const log = require('js-log')();

function mergeProfile(user, profile) {
  if (!user.photo && profile.photos && profile.photos.length) {
    user.photo = profile.photos[0].value;
  }

  if (!user.email && profile.emails && profile.emails.length) {
    user.email = profile.emails[0].value;
  }

  if (!user.displayName && profile.displayName) {
    user.displayName = profile.displayName;
  }

  if (!user.gender && profile.gender) {
    user.gender = profile.gender;
  }

  for (var i = 0; i < user.providers.length; i++) {
    var provider = user.providers[i];
    if (provider.nameId == makeProviderId(profile)) {
      user.providers[i].profile = profile;
      break;
    }
  }

  if (i == user.providers.length) {
    user.providers.push({
      nameId:  makeProviderId(profile),
      profile: profile
    });
  }

  user.verifiedEmail = true;
}

function makeProviderId(profile) {
  return profile.provider + ":" + profile.id;
}

module.exports = function(profile, done) {
  // profile = the data returned by the facebook graph api

  log.debug(profile);

  co(function*() {
    var providerNameId = makeProviderId(profile);

    var user = yield User.findOne({"providers.id": providerNameId}).exec();

    if (!user) {
      // if we have user with same email, assume it's exactly the same person as the new man
      user = yield User.findOne({email: profile.emails[0].value}).exec();

      if (!user) {
        user = new User();
      }
    }

    mergeProfile(user, profile);

    try {
      yield function(callback) { user.validate(callback); };
    } catch (e) {
      // there's a required field
      // maybe, when the user was on the remote social login screen, he disallowed something?
      return done(null, false, "Недостаточно данных для регистрации, разрешите их передачу, пожалуйста.");
    }

    yield user.persist();

    return user;

  })(done);

};
