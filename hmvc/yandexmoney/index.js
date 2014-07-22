const config = require('config');
const jade = require('jade');
const path = require('path');
var payment = require('payment');
var Transaction = payment.Transaction;

var router = require('./router');

exports.middleware = router.middleware();

exports.createTransactionForm = function* (order) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    module: 'yandexmoney'
  });

  yield transaction.persist();

  return jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    clientId:          config.yandexmoney.clientId,
    redirectUri:       config.yandexmoney.redirectUri,
    purse:             config.yandexmoney.purse,
    transactionNumber: transaction.number,
    amount:            transaction.amount
  });

};
