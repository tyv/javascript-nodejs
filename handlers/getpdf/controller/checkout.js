var mongoose = require('mongoose');
var payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var t = require("i18next").t;

exports.post = function*(next) {

  yield* this.loadOrder();

  var paymentMethod = this.request.body.paymentMethod;
  var method = payments.methods[paymentMethod];

  if (!method) {
    this.throw(403, "Unsupported payment method");
  }

  if (this.order) {
    // checking out a pre-existing order

    this.log.debug("order exists", this.order.number);
    yield* updateOrderFromBody(this.request.body, this.req.user, this.order);

  } else {
    // if we don't have the order in our database, then make a new one
    // (use the incoming order post for that, but don't trust all its fields)

    this.log.debug(this.request.body.orderTemplate);

    var orderTemplate = yield OrderTemplate.findOne({
      slug: this.request.body.orderTemplate,
      user: this.req.user && this.req.user._id,
      email: this.req.user && this.req.user.email
    }).exec();

    if (!orderTemplate) {
      this.throw(404);
    }

    this.log.debug("GOT TEMPLATE");

    // create order from template, don't trust the incoming post
    this.order = Order.createFromTemplate(orderTemplate, {
      module: 'getpdf'
    });

    yield* updateOrderFromBody(this.request.body, this.req.user, this.order);

    this.log.debug("order created", this.order.number);

    if (!this.session.orders) {
      this.session.orders = [];
    }
    this.session.orders.push(this.order.number);
  }

  var result = yield* payments.createTransactionFormOrResult(this.order, paymentMethod);

  this.body = result;

};

function* updateOrderFromBody(body, user, order) {
  if (!user) {
    // a logged-in user always makes order for his email
    // (can resend the goods to someone else if needed)
    order.email = body.email;
  }
  order.markModified('data');

  yield order.persist();
}
