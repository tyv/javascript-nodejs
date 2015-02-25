var User = require('../models/user');
var _ = require('lodash');
var imgur = require('imgur');
var multiparty = require('multiparty');
var co = require('co');
var thunkify = require('thunkify');
var config = require('config');
var sendMail = require('sendMail');
var path = require('path');

exports.get = function*(next) {

  var fields = 'created displayName realName birthday email gender country town publicEmail'.split(' ');

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


var readMultipart = thunkify(function(req, done) {

  var hadError = false;
  var fields = {};

  // initially we're waiting for form.close only
  // each part increases the counter on start and decreases back when nested processing (upoading) is done
  var waitStreamsCount = 1;
  var form = new multiparty.Form();

  form.on('field', function(name, value) {
    fields[name] = value;
  });

  // multipart file must be the last
  form.on('part', function(part) {
    waitStreamsCount++;
    if (!part.filename) {
      return onError(new Error("No filename for form part " + part.name));
    }

    co(function*() {
      return yield* imgur.uploadStream(part.filename, part.byteCount, part);
    }).then(function(result) {
      if (hadError) return;
      fields[part.name] = result;
      onStreamDone();
    }, onError);
  });

  form.on('error', onError);

  form.on('close', onStreamDone);

  form.parse(req);

  function onStreamDone() {
    if (hadError) return;
    waitStreamsCount--;
    if (!waitStreamsCount) {
      done(null, fields);
    }
  }

  function onError(err) {
    if (hadError) return;
    hadError = true;
    done(err);
  }

});

/* Partial update */
exports.patch = function*(next) {

  var user = this.params.user;

  var fields;
  try {
    fields = yield readMultipart(this.req);
  } catch (e) {
    if (e.name == 'BadImageError') {
      this.throw(400, e.message);
    } else {
      throw e;
    }
  }

  'displayName realName birthday gender photo country town interests publicEmail'.split(' ').forEach(function(field) {
    if (field in fields) {
      user[field] = fields[field];
    }
  });

  if (fields.email !== undefined && fields.email != user.email) {

    var isOccupied = yield User.findOne({email: fields.email}).exec();

    if (isOccupied) {
      this.throw(409, "Такой email используется другим пользователем.");
    }

    user.pendingVerifyEmail = fields.email;
    user.verifyEmailToken = Math.random().toString(36).slice(2, 10);
    user.verifyEmailRedirect = '/profile/account';

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
      this.renderValidationError(e);
    }
    return;
  }

  this.body = user.getInfoFields();

};
