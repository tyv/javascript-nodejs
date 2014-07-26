const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;

exports.get = function*(next) {
  this.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  yield* this.loadOrder();

  var lastTransaction = yield Transaction.findOne({ order: this.order._id }).sort({created: -1}).exec();

  if (!lastTransaction.status) {
    this.body = '';
    this.status = 204; // no content
    return;
  }

  if (lastTransaction) {
    console.log(lastTransaction.getStatusDescription);
    this.body = lastTransaction.getStatusDescription();
  }

};
