var loadOrder = require('../../lib/loadOrder');
var Order = require('../../models/order');
var _ = require('lodash');

// all order modifications pass through this common module
// which may delegate to order modules
exports.patch = function*() {

  yield* this.loadOrder();

  if (!this.order) {
    this.throw(404, 'Нет такого заказа.');
  }

  var orderModule = require(this.order.module);

  if (orderModule.patch) {
    yield* orderModule.patch.call(this);
  } else {
    this.body = {};
  }

};

exports.del = function*() {

  yield* this.loadOrder();

  if (!this.order) {
    this.throw(404, 'Нет такого заказа.');
  }

  yield this.order.persist({
    status: Order.STATUS_CANCEL
  });

  this.body = 'ok';
};

