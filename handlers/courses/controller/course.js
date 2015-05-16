var moment = require('momentWithLocale');
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var money = require('money');

exports.get = function*() {

  this.locals.course = yield Course.findOne({
    slug: this.params.course
  }).exec();

  if (!this.locals.course) {
    this.throw(404);
  }

  this.locals.title = this.locals.course.title;
  this.locals.rateUsdRub = money.convert(1, {from: 'USD', to: 'RUB'});


  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YYYY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.locals.groups = yield CourseGroup.find({
    isListed: true,
    dateStart: {
      $gt: new Date()
    },
    course: this.locals.course._id
  }).sort({
    dateStart: 1
  }).exec();

  this.body = this.render('courses/' + this.locals.course.slug);
};
