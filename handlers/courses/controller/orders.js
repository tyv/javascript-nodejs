var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var config = require('config');
var moment = require('momentWithLocale');
var money = require('money');


exports.get = function*() {

  yield* this.loadOrder({
    ensureSuccessTimeout: 5000
  });

  this.nocache();

  this.locals.sitetoolbar = true;
  this.locals.title = 'Заказ №' + this.order.number;

  this.locals.order = this.order;

  var group = this.locals.group = yield CourseGroup.findOne({
    slug: this.order.data.slug
  }).populate('course').exec();

  if (!group) {
    this.throw(404);
  }

  var course = group.course;

  this.locals.paymentMethods = require('../lib/paymentMethods');

  this.locals.orderInfo = yield* getOrderInfo(this.order);

  this.locals.breadcrumbs = [
    {title: 'JavaScript.ru', url: 'http://javascript.ru'},
    {title: 'Курсы', url: '/courses'}
  ];

  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };


  this.body = this.render('order');
};
