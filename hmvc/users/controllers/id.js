var User = require('../models/user');
var _ = require('lodash');

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

/* Partial update */
exports.patch = function*(next) {
  var fields = this.request.body;

  var user = this.params.user;

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
    // remember before saving
    var modifiedPaths = user.modifiedPaths();

    yield user.persist();
    this.body = {};

    modifiedPaths.forEach(function(field) {
      this.body[field] = user[field];
    }, this);

  } catch(e) {
    console.log(e.stack);
    if (e.name != 'ValidationError') {
      this.throw(e);
    }

    this.renderValidationError(e);
  }

};
