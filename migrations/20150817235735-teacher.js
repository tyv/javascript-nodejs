var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');
var CourseGroup = require('courses').CourseGroup;
var User = require('users').User;

exports.up = function*() {

  var ilya = yield User.findOne({
    email: 'iliakan@gmail.com'
  });

  var mikhail = yield User.findOne({
    email: 'glukym@gmail.com'
  });

  var groups = yield CourseGroup.find({});

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    group.teacher = ilya._id;

    yield group.save();
  }

  CourseGroup.update({slug: "js-20151005-2130"}, {teacher: mikhail._id});
  CourseGroup.update({slug: "js-20151005"}, {teacher: mikhail._id});
  CourseGroup.update({slug: "js-20150811"}, {teacher: mikhail._id});

};

exports.down = function*() {
  throw new Error("Rollback not implemented");
};

