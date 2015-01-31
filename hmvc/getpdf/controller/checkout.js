var mongoose = require('mongoose');
var payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;

exports.post = function*(next) {

  yield* this.loadOrder();
  var paymentMethod = this.request.body.paymentMethod;
  var method = payments.methods[paymentMethod];
  if (!method) {
    this.throw(403, "Unsupported payment method");
  }

  if (this.order) {
    this.log.debug("order exists", this.order.number);
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

    this.log.debug("order created", this.order.number);

    if (!this.session.orders) {
      this.session.orders = [];
    }
    this.session.orders.push(this.order.number);
  }

  var form = yield* payments.createTransactionForm(this.order, paymentMethod);

  this.body = form;

};

function* updateOrderFromBody(body, order) {
  order.email = body.email;
  order.markModified('data');

  yield order.persist();
}
