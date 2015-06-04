var User = require('../models/user');
var _ = require('lodash');
var imgur = require('imgur');
var multiparty = require('multiparty');
var co = require('co');
var thunkify = require('thunkify');
var config = require('config');
var sendMail = require('mailer').send;
var path = require('path');
var ImgurImage = require('imgur').ImgurImage;

exports.get = function*(next) {

  var fields = 'created displayName realName birthday email gender country town interests profileName publicEmail'.split(' ');

  this.body = { };
  fields.forEach( function(field) {
    this.body[field] = this.params.user[field];
  }, this);

  this.body.photo = this.params.user.getPhotoUrl();

  this.body.hasPassword = Boolean(this.params.user.passwordHash);

  this.body.providers = this.params.user.providers.map(function(provider) {
    return {
      name: provider.name,
      photo: provider.profile.photos && provider.profile.photos[0] && provider.profile.photos[0].value,
      displayName: provider.profile.displayName
    };
  });


};

/* Deleting a user */
exports.del = function*(next) {
  var user = this.params.user;

  yield function(callback) {
    user.softDelete(callback);
  };

  this.logout();

  this.body = {
    deleted: true,
    modified: user.modified
  };
};

/* Partial update */
exports.patch = function*(next) {

  var user = this.params.user;

  var fields = this.request.body;

  'displayName realName birthday gender country town interests profileName publicEmail'.split(' ').forEach(function(field) {
    if (field in fields) {
      user[field] = fields[field];
    }
  });

  if (fields.photoId) {
    var imgurImage = yield ImgurImage.findOne({imgurId: fields.photoId}).exec();
    if (!imgurImage) {
      this.throw(404, "Нет такого изображения в базе");
    }
    user.photo = imgurImage.link;
  }

  if (fields.email !== undefined && fields.email != user.email) {

    var isOccupied = yield User.findOne({email: fields.email}).exec();

    if (isOccupied) {
      this.throw(409, "Такой email используется другим пользователем.");
    }

    user.pendingVerifyEmail = fields.email;
    user.verifyEmailToken = Math.random().toString(36).slice(2, 10);
    user.verifyEmailRedirect = user.getProfileUrl();

    yield sendMail({
      templatePath: path.join(this.templateDir, 'verify-change-email'),
      to: user.pendingVerifyEmail,
      subject: "Подтвердите смену email",
      link: config.server.siteHost + '/auth/verify/' + user.verifyEmailToken
    });

  }

  if (fields.password) {
    if (user.passwordHash && !user.checkPassword(fields.passwordOld)) {
      this.throw(400, "Старый пароль неверен.");
    }

    user.password = fields.password;
  }

  try {
    yield user.persist();
  } catch(e) {
    if (e.name != 'ValidationError') {
      throw e;
    } else {
      // rethrow as a single ordinary error
      var message;
      for(var key in e.errors) {
        message = e.errors[key].message;
        break;
      }
      this.throw(400, message);
    }
    return;
  }

  this.body = user.getInfoFields();

};
