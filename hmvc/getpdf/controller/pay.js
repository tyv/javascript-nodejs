var mongoose = require('mongoose');
var log = require('js-log')();
var payments = require('payments');
var Order = payments.Order;
var methods = require('../paymentMethods').methods;

log.debugOn();

exports.post = function*(next) {

  yield* this.loadOrder();

  var method = methods[this.request.body.paymentMethod];
  if (!method) {
    this.throw(403, "Unsupported payment method");
  }

  if (this.order) {
    log.debug("order exists", this.order.number);
    yield* updateOrderFromBody(this.request.body, this.order);
  } else {
    // new order template
    this.order = new Order({
      amount: 1,
      module: 'getpdf',
      data: { }
    });

    yield* updateOrderFromBody(this.request.body, this.order);

    log.debug("order created", this.order.number);

    if (!this.session.orders) {
      this.session.orders = [];
    }
    this.session.orders.push(this.order.number);
  }

  var form = yield* payments.createTransactionForm(this.order, method.name);

  this.body = form;

};

function* updateOrderFromBody(body, order) {
  order.data.email = body.email;
  order.markModified('data');

  yield order.persist();
}
