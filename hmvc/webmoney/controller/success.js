const config = require('config');
const mongoose = require('mongoose');
const payment = require('payment');
const Transaction = payment.Transaction;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {

  var transaction = this.transaction;
  var order = this.transaction.order;

  var successUrl = payment.getOrderSuccessUrl(order);
  var failUrl = payment.getOrderUrl(order);

  log.debug("transaction status: " + transaction.status);

  if (transaction.status) {
    this.redirect(transaction.status == Transaction.STATUS_SUCCESS ? successUrl : failUrl);
  } else {
    this.render(__dirname, 'wait', {
      transactionNumber: transaction.number,
      successUrl: successUrl,
      failUrl: failUrl
    });
  }

};
