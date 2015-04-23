const Transaction = require('../../models/transaction');

exports.get = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.transaction.persist({
    status: Transaction.STATUS_FAIL,
    statusMessage: 'оплата не прошла'
  });

  this.redirectToOrder();
};


