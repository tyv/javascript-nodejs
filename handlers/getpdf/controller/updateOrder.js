var mongoose = require('mongoose');
var payments = require('payments');
var Order = payments.Order;
var Transaction = payments.Transaction;

// waits for order state change
// returns:
//  { status: success|fail }
// OR
//  { timeout: true }
exports.post = function*(next) {

  var startTime = new Date();
  var retryDelay;

  while (true) {
    if (new Date() - startTime > 3 * 60 * 1e3) { // 3 minutes wait max
      this.body = {timeout: true};
      return;
    }

    yield* this.loadOrder({ reload: true });

    // maybe the payment module can ask for an update
    var transaction = yield Transaction.findOne({
      order:  this.order._id,
      status: Transaction.STATUS_PENDING_ONLINE
    }).exec();

    if (transaction) {
      var method = payments.methods[transaction.paymentMethod];
      if (method.updatePendingOnlineTransactionStatus) {
        // if method can do that,
        // Yandex.Money can ask for an update
        // most modules just wait for callbacks
        retryDelay = yield* method.updatePendingOnlineTransactionStatus(transaction);
      }
    }

    // order finished now
    if (this.order.status != Order.STATUS_PENDING) {
      return {status: this.order.status};
    }

    // otherwise wait for a callback or something that changes the order state
    yield delay(retryDelay || 1000);
  }
};



function delay(ms) {
  return function(callback) {
    setTimeout(callback, ms);
  };
}
