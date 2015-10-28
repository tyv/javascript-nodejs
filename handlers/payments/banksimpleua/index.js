const Transaction = require('../models/transaction');
const path = require('path');
const config = require('config');
const money = require('money');

exports.renderForm = require('./renderForm');

// TX gets this status when created
exports.createTransaction = function*(order) {

  var amount = Math.round(money.convert(order.amount, {from: config.payments.currency, to: 'UAH'}));


  var transaction = new Transaction({
    order:  order._id,
    amount: amount,
    status: Transaction.STATUS_PENDING,
    paymentMethod: path.basename(__dirname)
  });

  yield transaction.persist();

  return transaction;
};

exports.info = {
  title:   "Банковский перевод в Украине (в гривнах)",
  name:    path.basename(__dirname),
  hasIcon: false
};
