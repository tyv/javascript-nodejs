const config = require('config');
const jade = require('jade');
const path = require('path');
const Transaction = require('../models/transaction');

exports.renderForm = require('./renderForm');

exports.updatePendingOnlineTransactionStatus = require('./updatePendingOnlineTransactionStatus');

// TX gets this status when created
exports.createTransaction = function*(order) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    status: Transaction.STATUS_PENDING_ONLINE,
    paymentModule: path.basename(__dirname)
  });

  yield transaction.persist();

  return transaction;
};

exports.title = "Яндекс.Деньги";