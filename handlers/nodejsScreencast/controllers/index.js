var sendMail = require('mailer').send;
var path = require('path');
var config = require('config');

var CourseGroup = require('courses').CourseGroup;
var Course = require('courses').Course;
var money = require('money');
var moment = require('momentWithLocale');

exports.get = function*() {
  this.locals.siteToolbarCurrentSection = "nodejs-screencast";

  this.locals.rateUsdRub = money.convert(1, {from: 'USD', to: 'RUB'});

  var course = yield Course.findOne({slug: 'nodejs'}).exec();
  this.locals.groups = [];
  if (course) {
    this.locals.groups = yield CourseGroup.find({
      course: course._id,
      isOpenForSignup: true
    }).sort({dateStart: 1}).exec();
  }

  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YYYY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.body = this.render('index');
};
