var CourseParticipant = require('../models/courseParticipant');
var mongoose = require('mongoose');

exports.patch = function*() {

  var id = this.request.body.id;
  try {
    new mongoose.Types.ObjectId(id);
  } catch (e) {
    // cast error (invalid id)
    this.throw(404);
  }

  var participant = yield CourseParticipant.findById(id).exec();

  if (!participant) {
    this.throw(404);
  }

  if (String(participant.user) != String(this.user._id) && !this.isAdmin) {
    this.throw(403);
  }

  if ("shouldNotifyMaterials" in this.request.body) {
    participant.shouldNotifyMaterials = Boolean(this.request.body.shouldNotifyMaterials);
  }

  yield participant.persist();

  this.body = {message: "Данные обновлены."};

};
