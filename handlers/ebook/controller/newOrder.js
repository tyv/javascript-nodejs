const payments = require('payments');
var OrderTemplate = payments.OrderTemplate;

exports.get = function*() {
  this.nocache();

  var orderTemplates = yield OrderTemplate.find({
    module: 'ebook'
  }).sort({weight: 1}).exec();

  this.locals.orderTemplates = orderTemplates;

  this.locals.sitetoolbar = true;
  this.locals.title = "Покупка учебника JavaScript";

  this.locals.paymentMethods = require('../lib/paymentMethods');

  this.body = this.render('newOrder');
};
