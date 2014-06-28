const crypto = require('crypto');

const LEN = 128;
const ITERATIONS = 12000;

exports.createHash = function(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, LEN);
};

exports.createSalt = function() {
  return crypto.randomBytes(LEN).toString('base64');
};
