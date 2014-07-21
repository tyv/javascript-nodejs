const payment = require('../../payment');
const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {

  var transaction = this.transaction;
  var order = this.transaction.order;
  var successUrl = '/' + order.module + '/success/' + order.number;
  var failUrl = '/' + order.module + '/order/' + order.number;

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
