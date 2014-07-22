exports.middleware = {
  loadOrder:       require('./middleware/loadOrder'),
  loadTransaction: require('./middleware/loadTransaction')
};

exports.Order = require('./models/order');
exports.Transaction = require('./models/transaction');
exports.TransactionLog = require('./models/transactionLog');

exports.getOrderSuccessUrl = function(order) {
  return '/' + order.module + '/success/' + order.number;
};
exports.getOrderUrl = function(order) {
  return '/' + order.module + '/order/' + order.number;
};

exports.getOrderPendingUrl = function(order) {
  return '/' + order.module + '/pending/' + order.number;
};

