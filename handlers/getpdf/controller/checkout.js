var mongoose = require('mongoose');
var payments = require('payments');
var Order = payments.Order;
var Transaction = payments.Transaction;
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

    // No many waiting transactions.
    // The old one must had been cancelled before this.
    yield* this.order.cancelPendingTransactions();

    yield* updateOrderFromBody(this.request.body, this.req.user, this.order);

  } else {
    // if we don't have the order in our database, then make a new one
    // (use the incoming order post for that, but don't trust all its fields)

    this.log.debug(this.request.body.orderTemplate);

    var orderTemplate = yield OrderTemplate.findOne({
      slug: this.request.body.orderTemplate
    }).exec();

    if (!orderTemplate) {
      this.throw(404);
    }

    // create order from template, don't trust the incoming post
    this.order = Order.createFromTemplate(orderTemplate, {
      module: 'getpdf',
      itemUrl: '/getpdf/' + orderTemplate.slug,
      user:   this.req.user && this.req.user._id,
      email:  this.req.user && this.req.user.email
    });

    yield* updateOrderFromBody(this.request.body, this.req.user, this.order);

    // must persist to create order.number
    yield this.order.persist();

    this.log.debug("order created", this.order.number);

    if (!this.session.orders) {
      this.session.orders = [];
    }
    this.session.orders.push(this.order.number);
  }


  this.order.status = Order.STATUS_PENDING;
  yield this.order.persist();

  var form = yield* payments.createTransactionForm(this.order, paymentMethod);

  this.body = {form: form};

};



function* updateOrderFromBody(body, user, order) {
  if (!user) {
    // a logged-in user always makes order for his email, no any other
    // (he can resend the goods to someone else if needed)
    order.email = body.email;
  }

  // if any freeform data
  // order.markModified('data');
}
