var mount = require('koa-mount');
var config = require('config');
var compose = require('koa-compose');
var path = require('path');
var assert = require('assert');
// Interaction with payment systems only.

var log = require('log')();

exports.loadOrder = require('./lib/loadOrder');
exports.loadTransaction = require('./lib/loadTransaction');

var Order = exports.Order = require('./models/order');
var OrderTemplate = exports.OrderTemplate = require('./models/orderTemplate');
var Transaction = exports.Transaction = require('./models/transaction');
var TransactionLog = exports.TransactionLog = require('./models/transactionLog');

var paymentMethods = exports.methods = {};

//  all submodules
for(var key in config.payments.modules) {
  paymentMethods[key] = require('./' + key);
  assert(paymentMethods[key].renderForm, key + ": no renderForm");
}

// delegate all HTTP calls to payment modules
// mount('/webmoney', webmoney.middleware())
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');
exports.init = function(app) {
  for(var name in paymentMethods) {
    app.use(mountHandlerMiddleware('/payments/' + name, path.join(__dirname, name)));
  }

  app.csrfChecker.addIgnorePath('/payments/:any*');
  app.verboseLogger.addPath('/payments/:any*');
};

exports.populateContextMiddleware = function*(next) {
  this.redirectToOrder = function(order) {
    order = order || this.order;
    this.redirect('/' + order.module + '/orders/' + order.number);
  };
  this.loadOrder = exports.loadOrder;
  this.loadTransaction = exports.loadTransaction;

//  this.checkPendingOnlineOrderStatus = exports.checkPendingOnlineOrderStatus;

  yield* next;
};

// creates transaction and returns the form to submit for its payment OR the result
// delegates to the method
exports.createTransactionForm = function* (order, method) {

  var paymentMethod = paymentMethods[method];

  var transaction = yield* paymentMethod.createTransaction(order);
  log.debug("new transaction", transaction.toObject());

  var form = yield* paymentMethod.renderForm(transaction);

  yield* transaction.log('form', form);

  return form;

};


