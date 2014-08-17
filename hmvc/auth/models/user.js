var mongoose = require('mongoose');
var hash = require('../lib/hash');


var ProviderSchema = new mongoose.Schema({
  nameId:      {
    type:  String,
    index: true
  },
  profile: {}
});



var UserSchema = new mongoose.Schema({
  displayName:      {
    type:     String,
    required: true
  },
  email:         {
    type:     String,
    unique:   true,
    required: true,
    index:    true
  },
  passwordHash:  {
    type: String // user may have no password if used facebook to login/register
  },
  salt:          {
    type: String
  },
  providers:      [ProviderSchema],
  gender:        {
    type: String,
    enum: ['male', 'female']
  },
  created:       {
    type:    Date,
    default: Date.now
  },
  verifiedEmail: {
    type: Boolean,
    default: false
  },
  verifyEmailTokens: { // multiple tokens (may be many verify attempts)
    type: [String],
    index: true
  },
  verifyEmailRedirect: String, // where to redirect after verify
  passwordResetToken: String, // refresh with each request
  passwordResetTokenExpires: Date, // valid until this date
  photo:        {
    type: String
  }
});

UserSchema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = hash.createSalt();
    this.passwordHash = hash.createHashSlow(password, this.salt);
  })
  .get(function() {
    return this._plainPassword;
  });

UserSchema.methods.checkPassword = function(password) {
  return hash.createHashSlow(password, this.salt) == this.passwordHash;
};

UserSchema.path('email').validate(function(value) {
  // wrap in new RegExp instead of /.../, to evade WebStorm validation errors (buggy webstorm)
  return new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,12}$').test(value);
}, 'Укажите, пожалуйста, корретный email.');

// all references using mongoose.model for safe recreation
// when I recreate model (for tests) => I can reload it from mongoose.model (single source of truth)
// exports are less convenient to update
module.exports = mongoose.model('User', UserSchema);

