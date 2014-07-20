const payment = require('../../payment');
const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('javascript-log')(module);
const md5 = require('MD5');

log.debugOn();



exports.post = function* (next) {

  var transaction = yield Transaction.findOne({number: this.query.number}).populate('order').exec();

  if (!transaction) {
    this.throw(404, 'transaction not found');
  }

  if (!this.session.orders || this.session.orders.indexOf(transaction.order.number) == -1) {
    this.throw(403, 'order not in your session');
  }

  var attempt = 0;
  while (!transaction.status) {
    attempt++;
    if (attempt == 10) {
      log.debug("timeout");
      this.body = 'TIMEOUT';
      return;
    }

    yield delay(1000);

    transaction = yield Transaction.findOne({number: this.query.number }).exec();
  }

  log.debug('received');

  this.body = 'RECEIVED';
};

function delay(ms) {
  return function(callback) {
    setTimeout(callback, ms);
  };
}
