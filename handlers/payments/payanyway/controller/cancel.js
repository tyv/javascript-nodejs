const Transaction = require('../../models/transaction');

exports.get = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID');

  this.transaction.persist({
    status: Transaction.STATUS_FAIL,
    statusMessage: 'отказ от оплаты'
  });

  this.redirectToOrder();
};


