var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');

exports.get = function*() {

  this.locals.course = yield Course.findOne({
    slug: this.params.course
  }).exec();

  if (!this.locals.course) {
    this.throw(404);
  }

  this.locals.groups = yield CourseGroup.find({
    course: this.locals.course._id
  }).sort({
    dateStart: 1
  }).exec();

  this.body = this.render('courses/' + this.locals.course.slug);
};
