
const path = require('path');
const Transaction = require('../models/transaction');

exports.renderForm = require('./renderForm');

exports.createTransaction = function*(order) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    status: Transaction.STATUS_PENDING,
    paymentMethod: path.basename(__dirname)
  });

  yield transaction.persist();

  return transaction;
};

exports.title = "PayPal";
