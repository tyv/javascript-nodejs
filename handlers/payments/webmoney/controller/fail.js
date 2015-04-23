const mongoose = require('mongoose');
const Transaction = require('../../models/transaction');

exports.post = function* (next) {

  yield* this.loadTransaction('LMI_PAYMENT_NO');

  yield this.transaction.persist({
    status: Transaction.STATUS_FAIL
  });

  this.redirectToOrder();

};
