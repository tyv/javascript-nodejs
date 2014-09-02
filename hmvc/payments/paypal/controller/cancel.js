const Transaction = require('../../models/transaction');

exports.get = function* (next) {

  yield* this.loadTransaction();

  yield this.transaction.persist({
    status: Transaction.STATUS_FAIL,
    statusMessage: 'отказ от оплаты'
  });

  this.redirectToOrder();
};

