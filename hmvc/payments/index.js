var mount = require('koa-mount');
var config = require('config');

// Interaction with payment systems only.

exports.loadOrder = require('./lib/loadOrder');
exports.loadTransaction = require('./lib/loadTransaction');

var Order = exports.Order = require('./models/order');
var Transaction = exports.Transaction = require('./models/transaction');
var TransactionLog = exports.TransactionLog = require('./models/transactionLog');

//  all submodules
var paymentModules = {};
for(var name in config.payments.modules) {
  paymentModules[name] = require('./' + name);
}

// mount('/webmoney', webmoney.middleware())
var paymentMounts = [];
for(var name in paymentModules) {
  paymentMounts.push(mount('/' + name, paymentModules[name].middleware));
}

// delegate all HTTP calls to payment modules
exports.middleware = function*(next) {

  for (var i = 0; i < paymentMounts.length; i++) {
    yield* paymentMounts[i].call(this, next);
  }

};

exports.populateContextMiddleware = function*(next) {
  this.redirectToOrder = function(order) {
    order = order || this.order;
    this.redirect('/' + order.module + '/order/' + order.number);
  };
  this.loadOrder = exports.loadOrder;
  this.loadTransaction = exports.loadTransaction;
  yield* next;
};

// creates transaction and returns the form to submit for its payment
// delegates form to the method
exports.createTransactionForm = function* (order, method) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    module: method
  });

  yield transaction.persist();

  return paymentModules[method].renderForm(transaction);

};



