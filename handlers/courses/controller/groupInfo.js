var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');

// Group info for a participant, with user instructions on how to login
// TODO
exports.get = function*() {

  var group = this.locals.group = yield CourseGroup.findOne({
    slug: this.params.group
  }).populate('course').exec();

  if (!group) {
    this.throw(404, "Нет такой группы.");
  }

  if (!this.user) {
    this.throw(401);
  }

  var participantIds = _.pluck(group.participants, 'user').map(String);
  if (!~participantIds.indexOf(this.user._id)) {
    this.throw(403, "Вы не являетесь участником этой группы.");
  }

  this.body = this.render('groupInfo/' + group.course.slug);
};
