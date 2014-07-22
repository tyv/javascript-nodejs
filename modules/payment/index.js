
exports.Order = require('./models/order');
exports.Transaction = require('./models/transaction');
exports.TransactionLog = require('./models/transactionLog');

var orderUtils = require('./lib/orderUtils');
exports.orderUtils = orderUtils;

var loadOrder = require('./lib/context/loadOrder');
var loadTransaction = require('./lib/context/loadTransaction');


exports.middleware = function*(next) {
  this.loadOrder = loadOrder;
  this.loadTransaction = loadTransaction;

  this.getOrderSuccessUrl = function() {
    return orderUtils.getSuccessUrl(this.order);
  };

  this.getOrderUrl = function() {
    return orderUtils.getUrl(this.order);
  };

  this.getOrderPendingUrl = function() {
    return orderUtils.getPendingUrl(this.order);
  };

  yield* next;
};

