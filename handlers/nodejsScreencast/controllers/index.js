var sendMail = require('mailer').send;
var path = require('path');
var config = require('config');

var CourseGroup = require('courses').CourseGroup;
var Course = require('courses').Course;

exports.get = function*() {
  this.locals.siteToolbarCurrentSection = "nodejs-screencast";

  var course = yield Course.findOne({slug: 'nodejs'}).exec();
  if (course) {
    var group = yield CourseGroup.findOne({course: course._id}).exec();
    if (group) {
      this.locals.hasOpenCourseGroups = true;
    }
  }

  this.body = this.render('index');
};
