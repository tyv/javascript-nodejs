'use strict';

var Course = require('../models/course');
var User = require('users').User;
var moment = require('momentWithLocale');

exports.get = function*() {

  var courses = yield Course.find({
    isListed: true
  }).sort({weight: 1}).exec();

  this.locals.coursesInfo = [];
  for (var i = 0; i < courses.length; i++) {
    var course = courses[i];
    this.locals.coursesInfo.push({
      url: course.getUrl(),
      title: course.title,
      shortDescription: course.shortDescription,
      hasOpenGroups: yield* course.hasOpenGroups()
    });
  }

  let teachers = yield User.find({
    teachesCourses: {$exists: true, $not: {$size: 0}}
  });


  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YYYY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.body = this.render('frontpage', {
    teachers
  });
};
