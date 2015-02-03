var mount = require('koa-mount');
var config = require('config');
var compose = require('koa-compose');
var path = require('path');
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

// delegate all HTTP calls to payment modules
// mount('/webmoney', webmoney.middleware())
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');
exports.init = function(app) {
  for(var name in exports.methods) {
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
  yield* next;
};

// creates transaction and returns the form to submit for its payment OR the result
// delegates to the method
exports.createTransactionFormOrResult = function* (order, method) {

  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    module: method
  });

  yield transaction.persist();

  console.log(transaction);

  var formOrResult = yield* exports.methods[method].renderFormOrResult(transaction);

  yield* transaction.log('formOrResult', formOrResult);

  return formOrResult;

};



