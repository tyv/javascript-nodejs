const Transaction = require('../../models/transaction');

exports.post = function* (next) {

  yield* this.loadTransaction('ik_pm_no');

  this.transaction.persist({
    status: Transaction.STATUS_FAIL,
    statusMessage: 'оплата не прошла'
  });

  this.redirectToOrder();
};


