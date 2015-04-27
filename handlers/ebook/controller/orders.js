const payments = require('payments');
var Order = payments.Order;
var getOrderInfo = payments.getOrderInfo;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;
var assert = require('assert');

// Existing order page
exports.get = function*() {

  yield* this.loadOrder({
    ensureSuccessTimeout: 5000
  });

  this.nocache();

  this.locals.sitetoolbar = true;
  this.locals.title = 'Заказ №' + this.order.number;

  this.locals.order = this.order;

  this.locals.user = this.req.user;

  this.locals.paymentMethods = require('../lib/paymentMethods');

  this.locals.orderInfo = yield* getOrderInfo(this.order);

  this.body = this.render('order');

};
