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
    module: 'paypal'
  });

  yield transaction.persist();

  return jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    email:     config.paypal.email,
    resultUrl: 'http://' + config.domain + '/paypal/result?transactionNumber=' + transaction.number,
    cancelUrl: 'http://' + config.domain + '/paypal/cancel?transactionNumber=' + transaction.number,
    successUrl: 'http://' + config.domain + '/paypal/success?transactionNumber=' + transaction.number

  });

};



