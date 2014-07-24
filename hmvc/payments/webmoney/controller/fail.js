const mongoose = require('mongoose');
const Transaction = require('../../models/transaction');
const log = require('js-log')();

log.debugOn();



exports.post = function* (next) {

  yield* this.loadTransaction('LMI_PAYMENT_NO');

  yield this.transaction.persist({
    status: Transaction.STATUS_FAIL
  });

  this.redirectToOrder();

};
