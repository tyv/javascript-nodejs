var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var config = require('config');

exports.get = function*() {

  var group = this.locals.group = yield CourseGroup.findOne({
    slug: this.params.group
  }).populate('course').exec();

  var course = group.course;

  if (!this.locals.group) {
    this.throw(404);
  }

  // only authorized users may signup
  if (!this.isAuthenticated()) {
    this.redirect(group.course.getUrl());
    return;
  }


  this.locals.title = course.title;

  this.locals.breadcrumbs = [
    { title: 'JavaScript.ru', url: 'http://javascript.ru' },
    { title: 'Курсы', url: '/courses' }
  ];


  // TODO

  this.body = this.render('signup');
};
