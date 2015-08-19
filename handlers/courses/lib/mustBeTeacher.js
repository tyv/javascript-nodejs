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
  } else {
    this.throw(403, "Вы не являетесь преподавателем этой группы.");
  }
};
