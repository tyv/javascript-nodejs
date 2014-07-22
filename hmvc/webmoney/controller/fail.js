const mongoose = require('mongoose');
const payment = require('payment');
const Order = payment.Order;
const Transaction = payment.Transaction;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {

  yield this.transaction.persist({
    status: Transaction.STATUS_FAIL
  });

  yield this.transaction.log({ event: 'fail' });

  var order = this.transaction.order;
  this.redirect(payment.getOrderUrl(order));

};
