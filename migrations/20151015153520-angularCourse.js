var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

var CourseGroup = require('courses').CourseGroup;
var Course = require('courses').Course;
var User = require('users').User;
var CourseFeedback = require('courses').CourseFeedback;

exports.up = function*() {

  var course = yield Course.create({
    "slug":             "angular",
    "videoKeyTag":      "js",
    "title":            "Курс по Angular.JS",
    "titleShort":       "Angular.JS",
    "shortDescription": "<p>Профессиональная разработка на Angular.JS.</p> <p>Стоимость обучения 9500 руб, время обучения: месяц.</p>",
    "isListed":         true,
    "weight":           3,
    "created":          new Date()
  });

  var stepan = yield User.findOne({
    profileName: 'stepan-suvorov'
  });

  stepan.displayName = 'Степан Суворов';
  stepan.teachesCourses = [course._id];
  stepan.country = 'Нидерланды';
  stepan.town = 'Амстердам';

  yield stepan.persist();

  yield CourseGroup.create({
    "course" : course._id,
    "dateStart" : new Date("2015-11-02T21:00:00Z"),
    "dateEnd" : new Date("2015-11-30T21:00:00Z"),
    "timeDesc" : "пн/чт 19:30 - 21:00 GMT+3",
    "slug" : "angular-20150702",
    "price" : 9500,
    "participantsLimit" : 20,
    "webinarId" : "103411835",
    "title" : "Курс Angular.JS (02.11)",
    "created" : new Date(),
    "isOpenForSignup" : true,
    "isListed" : true,
    "materials" : [],
    "teacher" : stepan._id
  });

};

exports.down = function*() {
  throw new Error("Rollback not implemented");
};
