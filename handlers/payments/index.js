var config = require('config');
var path = require('path');
var assert = require('assert');

var log = require('log')();

exports.loadOrder = require('./lib/loadOrder');
exports.loadTransaction = require('./lib/loadTransaction');
exports.getOrderInfo = require('./lib/getOrderInfo');

var Order = exports.Order = require('./models/order');
var OrderTemplate = exports.OrderTemplate = require('./models/orderTemplate');
var Transaction = exports.Transaction = require('./models/transaction');
var TransactionLog = exports.TransactionLog = require('./models/transactionLog');
var OrderCreateError = exports.OrderCreateError = require('./lib/orderCreateError');

var paymentMethods = exports.methods = require('./lib/methods');

// delegate all HTTP calls to payment modules
// mount('/webmoney', webmoney.middleware())
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');
exports.init = function(app) {
  for(var name in paymentMethods) {
    app.use(mountHandlerMiddleware('/payments/' + name, path.join(__dirname, name)));
  }

  app.use(mountHandlerMiddleware('/payments/common', path.join(__dirname, 'common')));

  app.csrfChecker.ignore.add('/payments/:any*');
  app.verboseLogger.logPaths.add('/payments/:any*');
};

exports.populateContextMiddleware = function*(next) {
  this.redirectToOrder = function(order) {
    order = order || this.order;
    this.redirect(order.getUrl());
  };
  this.loadOrder = exports.loadOrder;
  this.loadTransaction = exports.loadTransaction;

  yield* next;
};
