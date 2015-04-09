const Transaction = require('../../models/transaction');

exports.post = function* (next) {

  yield* this.loadTransaction('ik_pm_no');

  this.redirectToOrder();
};
