const CourseGroup = require('../models/courseGroup');
const CourseParticipant = require('../models/courseGroup');

module.exports = function*(slug, next) {

  var group = yield CourseGroup.findOne({
    slug: slug
  }).populate('course').exec();

  if (!group) {
    this.throw(404, "Нет такой группы.");
  }

  this.groupBySlug = group;

  yield* next;

};
