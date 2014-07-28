var mongoose = require('mongoose');
var log = require('js-log')();
var payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
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
    // if we don't have the order in our database, then make a new one
    // (use the incoming order post for that, but don't trust it)

    console.log(this.request.body.orderTemplate);

    var orderTemplate = yield OrderTemplate.findOne({
      slug: this.request.body.orderTemplate
    }).exec();

    if (!orderTemplate) {
      this.throw(404);
    }

    console.log("GOT TEMPLATE");
    // create order from template, don't trust the incoming post
    this.order = Order.createFromTemplate(orderTemplate, {
      module: 'getpdf',
      email: this.request.body.email
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
  order.email = body.email;
  order.markModified('data');

  yield order.persist();
}
