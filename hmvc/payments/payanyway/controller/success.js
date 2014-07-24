const Transaction = require('../../models/transaction');

exports.get = function* (next) {
  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.redirectToOrder();
};
