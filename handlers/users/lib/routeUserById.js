var mongoose = require('mongoose');
var User = require('../models/user');

module.exports = function*(id, next) {

  try {
    new mongoose.Types.ObjectId(id);
  } catch (e) {
    // cast error (invalid id)
    this.throw(404);
  }

  var user = yield User.findById(id).exec();

  if (!user) {
    this.throw(404);
  }

  this.userById = user;

  yield* next;

};
