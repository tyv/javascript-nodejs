const payment = require('../../payment');
const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('javascript-log')(module);
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {

  var transactionNumber = this.query.LMI_PAYMENT_NO;
  var transaction = yield Transaction.findOne({number: transactionNumber}).populate('order').exec();

  if (!transaction) {
    this.throw(404, 'transaction not found');
  }

  var order = transaction.order;
  if (!this.session.orders || this.session.orders.indexOf(order.number) == -1) {
    this.throw(403, 'order not in your session');
  }

  if (transaction.status) {
    this.redirect(transaction.status == Transaction.STATUS_SUCCESS ? order.getSuccessUrl() : order.getFailUrl());
  } else {
    this.render(__dirname, 'back', {
      number: this.query.LMI_PAYMENT_NO,
      module: '/' + transaction.order.module + '/finish'
    });
  }

};
