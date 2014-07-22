const jade = require('jade');
const path = require('path');
var config = require('config');
var payment = require('payment');

var Transaction = payment.Transaction;

var router = require('./router');

exports.middleware = router.middleware();

exports.createTransactionForm = function* (order) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    module: 'webmoney'
  });

  yield transaction.persist();

  return jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    purse:  config.webmoney.purse
  });

};



