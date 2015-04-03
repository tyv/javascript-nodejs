const payments = require('payments');
var OrderTemplate = payments.OrderTemplate;

exports.get = function*() {
  this.nocache();

  var orderTemplates = yield OrderTemplate.find({}).exec();

  this.locals.orderTemplates = orderTemplates;

  this.locals.sitetoolbar = true;
  this.locals.title = "Покупка учебника JavaScript";

  var paymentMethods = this.locals.paymentMethods = {};

  ['webmoney', 'yandexmoney', 'payanyway', 'paypal'].forEach(function(key) {
    paymentMethods[key] = {name: key, title: payments.methods[key].title};
  });

  this.body = this.render('new-order');
};
