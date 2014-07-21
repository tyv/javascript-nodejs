const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();


exports.get = function* (next) {

  this.transaction.status = Transaction.STATUS_FAIL;
  yield this.transaction.persist();

  yield new TransactionLog({
    event: 'fail',
    transaction: this.transaction._id
  }).persist();

  var order = this.transaction.order;
  this.redirect('/' + order.module + '/order/' + order.number);

};
