const config = require('config');
const mongoose = require('mongoose');
const payment = require('payment');
const Transaction = payment.Transaction;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {
  yield* this.loadTransaction('LMI_PAYMENT_NO');

  var transaction = this.transaction;
  var order = this.order;

  var successUrl = this.getOrderSuccessUrl();
  var failUrl = this.getOrderUrl();

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
