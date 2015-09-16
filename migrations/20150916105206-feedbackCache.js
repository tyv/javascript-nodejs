var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

var CourseGroup = require('courses').CourseGroup;
var CourseFeedback = require('courses').CourseFeedback;

exports.up = function*() {

  var feedbacks = yield CourseFeedback.find({}).populate('group participant');
  for (var i = 0; i < feedbacks.length; i++) {
    var feedback = feedbacks[i];
    feedback.teacherCache = feedback.group.teacher;
    feedback.userCache = feedback.participant.user;
    yield feedback.persist();
  }

};

exports.down = function*() {
  throw new Error("Rollback not implemented");
};
