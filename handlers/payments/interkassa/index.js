const Transaction = require('../models/transaction');
const path = require('path');

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
  title: "Интеркасса",
  name:    path.basename(__dirname),
  hasIcon: false,
  cards: ['privatbank'],
  subtitle: "оплата через банк для Украины"
};
