const Transaction = require('../models/transaction');
const path = require('path');

exports.renderForm = require('./renderForm');

// TX gets this status when created
exports.createTransaction = function*(order) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    status: Transaction.STATUS_PENDING_ONLINE,
    paymentMethod: path.basename(__dirname)
  });

  yield transaction.persist();

  return transaction;
};


exports.title = "PayAnyWay";