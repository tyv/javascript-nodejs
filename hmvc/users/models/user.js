var mongoose = require('mongoose');
var hash = require('../lib/hash');
var troop = require('mongoose-troop');
var _ = require('lodash');

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
    default:  "", // need a value for validator to run
    validate: [
      {
        validator: function(value) {
          //console.log("VALIDATING", this.deleted, value, this.deleted ? true : (value.length > 0));
          return this.deleted ? true : (value.length >= 2);
        },
        msg:       "Имя пользователя должно иметь не менее 2 символов."
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
    default:  "", // need a value for validator to run
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
      errorMessage: "Такой e-mail уже используется."
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
  realName:                  String,
  // not Date, because Date requires time zone,
  // so if I enter 18.04.1982 00:00:00 in GMT+3 zone, it will be 17.04.1982 21:00 actually (prbably wrong)
  // string is like a "date w/o time zone"
  birthday:                  String,
  verifiedEmail:             {
    type:    Boolean,
    default: false
  },

  // we store all verified emails of the user for the history & account restoration issues
  verifiedEmailsHistory: [{date: Date, email: String}],

  // new not-yet-verified email, set on change attempt
  pendingVerifyEmail:        String,

  // impossible-to-guess token
  // used on both new user & email change
  // new user:
  //  - generate a random roken
  //  - keep/resend on verification attempts (so that a user can use any letter, that's convenient)
  // email change:
  //  - generate a random token
  //  - regenerate on change attempts (if entered a wrong email, next letter will void the previous one)
  // cleared after use
  verifyEmailToken:          {
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
  photo:                     {/* { link: ..., } */}, // imgur data
  country:                   String,
  town:                      String,
  interests:                 String,
  deleted:                   { // private & login data is deleted
    type:    Boolean,
    default: false
  },
  readOnly:                  Boolean,  // data is not deleted, just flagged as banned
  isAdmin:                   Boolean
  /* created, modified from plugin */
});

UserSchema.virtual('password')
  .set(function(password) {

    if (password !== undefined) {
      if (password.length < 4) {
        this.invalidate('password', 'Пароль должен быть минимум 4 символа.');
      }
    }

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

// get all fields available to a visitor (except the secret/internal ones)
UserSchema.methods.getAllPublicFields = function() {
  return User.getAllPublicFields(this);
};


UserSchema.statics.getAllPublicFields = function(user) {
  return {
    displayName:   user.displayName,
    gender:        user.gender,
    country:       user.country,
    town:          user.town,
    interests:     user.interests,
    email:         user.email,
    verifiedEmail: user.verifiedEmail,
    photo:         user.photo && user.photo.link,
    deleted:       user.deleted,
    readOnly:      user.readOnly,
    isAdmin:       user.isAdmin
  };
};


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

UserSchema.statics.photoDefault = "http://i.imgur.com/zSGftLc.png";
UserSchema.statics.photoDeleted = "http://i.imgur.com/7KZD6XK.png";

UserSchema.methods.getPhotoUrl = function(width, height) {
  var url = this.deleted ? User.photoDeleted :
    !this.photo ? User.photoDefault : this.photo.link;

  var modifier = (width < 320 && height < 320) ? 't' :
    (width < 640 && height < 640) ? 'm' :
      (width < 1280 && height < 1280) ? 'l' : '';

  return url.slice(0, url.lastIndexOf('.')) + modifier + url.slice(url.lastIndexOf('.'));

};

UserSchema.plugin(troop.timestamp, {useVirtual: false});

// all references using mongoose.model for safe recreation
// when I recreate model (for tests) => I can reload it from mongoose.model (single source of truth)
// exports are less convenient to update
var User = module.exports = mongoose.model('User', UserSchema);

