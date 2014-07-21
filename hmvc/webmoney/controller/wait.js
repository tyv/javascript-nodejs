const payment = require('../../payment');
const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();



exports.post = function* (next) {

  var attempt = 0;
  while (!this.transaction.status) {
    attempt++;
    if (attempt == 10) {
      log.debug("timeout");
      this.body = 'TIMEOUT';
      return;
    }

    yield delay(1000);

    this.transaction = yield Transaction.findOne({number: this.transaction.number }).exec();
  }

  log.debug('received');

  this.body = this.transaction.status;
};

function delay(ms) {
  return function(callback) {
    setTimeout(callback, ms);
  };
}
