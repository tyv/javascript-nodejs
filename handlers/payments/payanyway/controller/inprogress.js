const Transaction = require('../../models/transaction');

exports.get = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.transaction.persist({
    status: Transaction.PENDING_OFFLINE
  });

  this.redirectToOrder();
};


