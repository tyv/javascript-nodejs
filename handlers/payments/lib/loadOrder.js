var mongoose = require('mongoose');
var Order = require('../models/order');
var Transaction = require('../models/transaction');
var assert = require('assert');

// Populates this.order with the order by "orderNumber" parameter
module.exports = function* (options) {
  options = options || {};

  var field = options.field || 'orderNumber';

  var orderNumber = this.request.body && this.request.body[field] || this.params[field] || this.query[field];

  if (!orderNumber) {
    if (options.throwIfNotFound) {
      this.throw(404, 'Отсутствует номер заказа');
    } else {
      return;
    }
  }

  function findOrder() {
    return Order.findOne({number: orderNumber}).populate('user').exec();
  }

  var order = yield findOrder();

  if (!order) {
    this.throw(404, 'Нет такого заказа');
  }


  // order.module.onPaid hook may take some time
  // it happens that the transaction is already SUCCESS, but the order is still PAID, not SUCCESS
  // in this case reload the order
  if (order.status == Order.STATUS_PAID && options.ensureSuccessTimeout) {

    // let the onPaid hook to finish
    var datediff = new Date() - new Date(order.modified);
    while (datediff < options.ensureSuccessTimeout) {
      // give it a second to finish and retry, usually up to max 5 seconds
      this.log.debug("tx success, but order pending => wait 1s until onPaid hook (maybe?) finishes");
      yield function(callback) {
        setTimeout(callback, 1000);
      };
      datediff += 1000;
      order = yield findOrder();
    }
  }


  //console.log("CHECK", this.req.user._id, order);

  var belongsToUser = this.user && order.user && (String(this.user._id) == String(order.user._id));

  var orderInSession = this.session.orders && this.session.orders.indexOf(order.number) != -1;

  // allow to load order which belongs to the user or in the current session
  // if the order is not in session (
  if (!orderInSession && !belongsToUser && !this.isAdmin) {
    this.throw(403, 'Access denied', {
      message: 'Доступ запрещён',
      description: 'Возможно, этот заказ не ваш, вы не авторизованы, или сессия истекла.'
    });
  }

  if (!options.reload) {
    // order must be loaded only once
    // (otherwise it's probably a bug)
    // (unless we know what we're doing)
    assert(!this.order, "this.order is already set (by loadTransaction?)");
  }

  this.log.debug("order", order.toObject());

  this.order = order;

};

/*
function* reloadOrderUntilSuccessFinish() {

  var lastTransaction = yield Transaction.findOne({
    order: this.order._id
  }).sort({modified: -1}).limit(1).exec();

  if (lastTransaction.status == Transaction.STATUS_SUCCESS &&
    this.order.status == Order.STATUS_PENDING) {
    // PENDING order, but Transaction.STATUS_SUCCESS?
    // means that order onPaid failed to finalize the job
    // OR just did not finish it yet
    var datediff = new Date() - new Date(lastTransaction.modified);
    while(datediff < Order.MAX_ONSUCCESS_TIME) {
      // give it a second to finish and retry, up to max 5 seconds
      this.log.debug("tx success, but order pending => wait 1s until onPaid hook (maybe?) finishes");
      yield function(callback) {
        setTimeout(callback, 1000);
      };
      datediff += 1000;
      yield* this.loadOrder({reload: true});
    }
  }

}
*/
