const config = require('config');
const jade = require('lib/serverJade');
const path = require('path');
const Transaction = require('../models/transaction');

exports.renderForm = require('./renderForm');

// TX gets this status when created
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


exports.info = {
  title: "Яндекс.Деньги",
  name:    path.basename(__dirname),
  hasIcon: true
};
