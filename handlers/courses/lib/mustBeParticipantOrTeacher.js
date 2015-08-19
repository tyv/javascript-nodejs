const _ = require('lodash');
const CourseParticipant = require('../models/courseParticipant');

module.exports = function*(next) {

  var group = this.groupBySlug;

  if (!this.user) {
    this.throw(401);
  }

  if (String(this.user._id) == String(this.groupBySlug.teacher)) {
    this.teacher = this.user;
    yield* next;
    return;
  }

  var participant = yield CourseParticipant.findOne({
    isActive: true,
    group: group._id,
    user: this.user._id
  });

  if (!participant) {
    this.throw(403, "Вы не являетесь участником этой группы.");
  }

  this.participant = participant;

  yield* next;
};
