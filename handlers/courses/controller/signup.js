var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var config = require('config');
var moment = require('momentWithLocale');
var money = require('money');


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

  this.locals.paymentMethods = require('../lib/paymentMethods');

  this.locals.title = course.title;

  this.locals.breadcrumbs = [
    { title: 'JavaScript.ru', url: 'http://javascript.ru' },
    { title: 'Курсы', url: '/courses' }
  ];

  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.locals.rateUsdRub = money.convert(1, {from: 'USD', to: 'RUB'});

  this.locals.groupInfo = {
    price:           group.price,
    participantsMax: group.participantsLimit
  };

  this.body = this.render('signup');
};
