var mongoose = require('lib/mongoose');
var hash = require('lib/hash');
var Schema = mongoose.Schema;

var schema = Schema({
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
  salt: String,
  hash: String,
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
    this.hash = hash.createHash(password, this.salt);
  })
  .get(function() {
    return this._plainPassword;
  });

schema.methods.checkPassword = function(password) {
  return hash.createHash(password, this.salt) == this.hash;
};

schema.path('email').validate(function(value) {
  // wrap in new RegExp instead of /.../, to evade WebStorm validation errors (buggy webstorm)
  return new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,10}$').test(value);
}, 'Укажите, пожалуйста, корретный email.');

// all references using mongoose.model for safe recreation
// when I recreate model (for tests) => I can reload it from mongoose.model (single source of truth)
// exports are less convenient to update
mongoose.model('User', schema);


