const crypto = require('crypto');
const config = require('config');

// warning, consumes time!
exports.createHashSlow = function(password, salt) {
  return crypto.pbkdf2Sync(password, salt, config.crypto.hash.iterations, config.crypto.hash.length);
};

exports.createSalt = function() {
  return crypto.randomBytes(config.crypto.hash.length).toString('base64');
};
