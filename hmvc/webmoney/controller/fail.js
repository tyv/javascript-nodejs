const mongoose = require('mongoose');
const payment = require('payment');
const Order = payment.Order;
const Transaction = payment.Transaction;
const log = require('js-log')();

log.debugOn();



exports.get = function* (next) {

  yield* this.loadTransaction();

  this.transaction.persist({
    status: Transaction.STATUS_FAIL
  });

  yield this.transaction.log({ event: 'fail' });

  this.redirect(this.getOrderUrl());

};
