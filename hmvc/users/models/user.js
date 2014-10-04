var mongoose = require('mongoose');
var hash = require('../lib/hash');
var troop = require('mongoose-troop');

var ProviderSchema = new mongoose.Schema({
  name:    String,
  nameId:  {
    type:  String,
    index: true
  },
  profile: {} // updates just fine if I replace it with a new value, w/o going inside
});

var UserSchema = new mongoose.Schema({
  displayName:               {
    type:     String,
    validate: [
      {
        validator: function(value) {
          return this.deleted ? true : (value.length > 0);
        },
        msg:       "Имя пользователя должно быть непустым."
      },
      {
        validator: function(value) {
          if (!value) return true;
          return value.length <= 256;
        },
        msg:       "Имя пользователя должно быть не длиннее 256 символов."
      }
    ]
  },
  email:                     {
    type:     String,
    // если посетитель удалён, то у него нет email!
    validate: [
      {
        validator: function checkNonEmpty(value) {
          return this.deleted ? true : (value.length > 0);
        },
        msg:       "E-mail пользователя не должен быть пустым."
      },
      {
        validator: function checkEmail(value) {
          return this.deleted ? true : /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg:       'Укажите, пожалуйста, корретный email.'
      }
    ],

    // sparse (don't index users without email)
    // dangerous: if mongodb uses this in queries (that search emails only), users w/o email will be ignored
    index:    {
      unique:       true,
      sparse:       true,
      errorMessage: "Такой e-mail уже используется другим пользователем."
    }
  },
  passwordHash:              {
    type: String // user may have no password if used facebook to login/register
  },
  salt:                      {
    type: String
  },
  providers:                 [ProviderSchema],
  gender:                    {
    type: String,
    enum: {
      values:  ['male', 'female'],
      message: "Неизвестное значение для пола."
    }
  },
  verifiedEmail:             {
    type:    Boolean,
    default: false
  },
  verifyEmailToken:          { // single impossible-to-guess token (resend if many verify attempts)
    type:  String,
    index: true
  },
  verifyEmailRedirect:       String, // where to redirect after verify
  passwordResetToken:        {  // refresh with each recovery request
    type:  String,
    index: true
  },
  passwordResetTokenExpires: Date, // valid until this date
  passwordResetRedirect:     String, // where to redirect after password recovery
  photo:                     String,
  deleted:                   Boolean, // private & login data is deleted
  readOnly:                  Boolean,  // data is not deleted, just flagged as banned
  isAdmin:                   Boolean
  /* created, modified from plugin */
});

UserSchema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;

    if (password) {
      this.salt = hash.createSalt();
      this.passwordHash = hash.createHashSlow(password, this.salt);
    } else {
      // remove password (unable to login w/ password any more, but can use providers)
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._plainPassword;
  });

UserSchema.methods.checkPassword = function(password) {
  if (!password) return false; // empty password means no login by password
  return hash.createHashSlow(password, this.salt) == this.passwordHash;
};

UserSchema.methods.softDelete = function(callback) {
  // delete this.email does not work
  // need to assign to undefined to $unset
  this.email = undefined;
  this.displayName = 'Аккаунт удалён';
  this.gender = undefined;
  this.verifyEmailToken = undefined;
  this.verifyEmailRedirect = undefined;
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpires = undefined;
  this.passwordResetRedirect = undefined;
  this.providers = [];
  this.password = undefined;

  this.photo = undefined; // TODO: deleted photo
  // keep verifiedEmail status as it was, maybe for some displays?
  //  user.verifiedEmail = false;

  this.deleted = true;

  this.save(function(err, user, numberAffected) {
    callback(err, user);
  });
};

UserSchema.statics.photoDefault = "http://i.imgur.com/QzBVuyI.png";
UserSchema.statics.photoDeleted = "http://i.imgur.com/R3o9RSd.png";

UserSchema.methods.getShowPhoto = function() {
  return this.photo || User.photoDefault;
};

UserSchema.plugin(troop.timestamp, {useVirtual: false});

// all references using mongoose.model for safe recreation
// when I recreate model (for tests) => I can reload it from mongoose.model (single source of truth)
// exports are less convenient to update
var User = module.exports = mongoose.model('User', UserSchema);

