var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');

exports.get = function*() {

  var group = this.locals.group = yield CourseGroup.findOne({
    slug: this.params.group
  }).populate('course').exec();

  if (!this.locals.group) {
    this.throw(404);
  }

  // only authorized users may signup
  if (!this.isAuthenticated()) {
    this.redirect(group.course.getUrl());
    return;
  }

  // TODO

  this.body = this.render('courses/' + this.locals.course.slug);
};
