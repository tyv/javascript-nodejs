var mongoose = require('mongoose');
var log = require('js-log')();
var Order = mongoose.models.Order;
var methods = require('../paymentMethods').methods;

log.debugOn();

exports.post = function*(next) {

  var method = methods[this.request.body.paymentMethod];
  if (!method) {
    this.throw(403, "Unsupported payment method");
  }
  var methodApi = this.app.hmvc[method.name]; // /hmvc/webmoney

  if (this.order) {
    log.debug("order exists", this.order.number);
    yield* updateOrderFromBody(this.request.body, this.order);
  } else {
    // this order is not saved anywhere,
    // it's only used to initially fill the form
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

  var form = yield* methodApi.createTransactionForm(this.order);

  this.body = form;

};

function* updateOrderFromBody(body, order) {
  order.data.email = body.email;
  order.markModified('data');

  yield order.persist();
}
