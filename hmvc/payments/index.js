var mount = require('koa-mount');
var config = require('config');
var compose = require('koa-compose');

// Interaction with payment systems only.

exports.loadOrder = require('./lib/loadOrder');
exports.loadTransaction = require('./lib/loadTransaction');

var Order = exports.Order = require('./models/order');
var OrderTemplate = exports.OrderTemplate = require('./models/orderTemplate');
var Transaction = exports.Transaction = require('./models/transaction');
var TransactionLog = exports.TransactionLog = require('./models/transactionLog');

exports.methods = {};

//  all submodules
for(var key in config.payments.modules) {
  exports.methods[key] = require('./' + key);
}

// mount('/webmoney', webmoney.middleware())
var paymentMounts = [];
for(key in exports.methods) {
  paymentMounts.push(mount('/' + key, exports.methods[key].middleware));
}

// delegate all HTTP calls to payment modules
exports.middleware = compose(paymentMounts);

exports.populateContextMiddleware = function*(next) {
  this.redirectToOrder = function(order) {
    order = order || this.order;
    this.redirect('/' + order.module + '/orders/' + order.number);
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

  console.log(transaction);

  var form = yield* exports.methods[method].renderForm(transaction);

  yield transaction.log('form', form);

  return form;

};



