var User = require('../models/user');
var _ = require('lodash');
var imgur = require('imgur');
var multiparty = require('multiparty');
var co = require('co');
var thunkify = require('thunkify');

exports.get = function*(next) {

  this.body = {
    displayName: this.params.user.displayName,
    email: this.params.user.email,
    created: this.params.user.created
  };

};

/* Deleting a user */
exports.del = function*(next) {
  var user = this.params.user;

  yield function(callback) {
    user.softDelete(callback);
  };

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
    })(function(err, result) {
      if (hadError) return;
      if (err) return onError(err);
      fields[part.name] = result;
      onStreamDone();
    });
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

  try {
    var fields = yield readMultipart(this.req);
  } catch (e) {
    if (e.name == 'BadImageError') {
      this.throw(400, e.message);
    } else {
      throw e;
    }
  }

  'displayName password gender photo'.split(' ').forEach(function(field) {
    if (field in fields) {
      user[field] = fields[field];
    }
  });

  if (fields.email !== undefined) {
    user.email = fields.email;
    user.verifiedEmail = false;
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

  this.body = user.getAllPublicFields();

};
