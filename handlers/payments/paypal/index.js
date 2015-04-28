const path = require('path');
const Transaction = require('../models/transaction');
const money = require('money');
const config = require('config');

exports.renderForm = require('./renderForm');

/**
 * Create transaction from order, using optional info in requestBody
 * @param order
 * @param requestBody
 * @returns {*|exports|module.exports}
 */
exports.createTransaction = function*(order, requestBody) {

  var currency = requestBody.paypalCurrency;
  if (!~Transaction.schema.path('currency').enumValues.indexOf(currency)) {
    throw(new Error("Unsupported currency:" + currency));
  }

  var amount = (order.currency == config.payments.currency) ?
    order.amount : Math.round(money.convert(order.amount, {from: config.payments.currency, to: currency}));

  var transaction = new Transaction({
    order:         order._id,
    amount:        amount,
    status:        Transaction.STATUS_PENDING,
    currency:      currency,
    paymentMethod: path.basename(__dirname)
  });

  yield transaction.persist();

  return transaction;

};

exports.info = {
  title:           'PayPal',
  name:            path.basename(__dirname),
  hasIcon:         true
};
