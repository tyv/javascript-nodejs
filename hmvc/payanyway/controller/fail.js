const mongoose = require('mongoose');
const payment = require('payment');
const Order = payment.Order;
const Transaction = payment.Transaction;
const log = require('js-log')();


exports.get = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.transaction.persist({
    status: Transaction.STATUS_FAIL
  });

  this.redirect(this.getOrderUrl());
};


