var mongoose = require('mongoose');

var Order = mongoose.models.Order;
var Transaction = mongoose.models.Transaction;

var methods = require('../paymentMethods').methods;

exports.post = function*(next) {

  var method = methods[this.request.body.paymentMethod];
  if (!method) {
    this.throw(403, "Unsupported payment method");
  }

  var methodApi = this.app.hmvc[method.name]; // /hmvc/webmoney

  var order = new Order({
    amount: 1,
    module: 'getpdf',
    data: { }
  });
  yield order.persist();


  var transaction = new Transaction({
    order:       order._id,
    amount:      order.amount,
    paymentType: 'webmoney'
  });

  yield transaction.persist();

  if (!this.session.transactions) {
    this.session.transactions = [];
  }
  this.session.transactions.push(transaction.number);

  var form = yield methodApi.createTransactionForm(transaction);

  this.body = form;

};
