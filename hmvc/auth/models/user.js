var mongoose = require('mongoose');
var hash = require('../lib/hash');

var Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  salt: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String
  }
});

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = hash.createSalt();
    this.passwordHash = hash.createHashSlow(password, this.salt);
  })
  .get(function() {
    return this._plainPassword;
  });

schema.methods.checkPassword = function(password) {
  return hash.createHashSlow(password, this.salt) == this.passwordHash;
};

schema.path('email').validate(function(value) {
  // wrap in new RegExp instead of /.../, to evade WebStorm validation errors (buggy webstorm)
  return new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,12}$').test(value);
}, 'Укажите, пожалуйста, корретный email.');

// all references using mongoose.model for safe recreation
// when I recreate model (for tests) => I can reload it from mongoose.model (single source of truth)
// exports are less convenient to update
module.exports = mongoose.model('User', schema);

