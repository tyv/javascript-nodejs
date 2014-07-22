const config = require('config');
const jade = require('jade');
const path = require('path');
var mongoose = require('mongoose');
var Transaction = mongoose.models.Transaction;

var router = require('./router');

exports.middleware = router.middleware();

exports.createTransactionForm = function* (order) {

  var transaction = new Transaction({
    order:       order._id,
    amount:      order.amount,
    paymentType: 'yandexmoney'
  });

  yield transaction.persist();

  return jade.renderFile(path.join(__dirname, 'template/form.jade'), {
    clientId: config.yandexmoney.clientId,
    redirectUri: config.yandexmoney.redirectUri,
    purse: config.yandexmoney.purse,
    transactionNumber: transaction.number,
    amount: transaction.amount
  });

};
