const Transaction = require('../../models/transaction');

exports.all = function* (next) {

  console.log("HERE");
  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.redirectToOrder();
};
