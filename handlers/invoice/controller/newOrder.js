const payments = require('payments');
var OrderTemplate = payments.OrderTemplate;

exports.get = function*() {
  this.nocache();

  this.locals.sitetoolbar = true;
  this.locals.title = "Оплата заказа";

  this.locals.paymentMethods = require('../lib/paymentMethods');


  this.body = this.render('new-order');
};
