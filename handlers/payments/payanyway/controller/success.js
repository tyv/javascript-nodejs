const Transaction = require('../../models/transaction');

exports.all = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.redirectToOrder();
};
