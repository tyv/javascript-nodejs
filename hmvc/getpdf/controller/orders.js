const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;

exports.get = function*(next) {
  this.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (this.params.orderNumber) {
    yield* this.loadOrder();
  } else {

    var orderTemplate = yield OrderTemplate.findOne({
      slug: this.params.orderTemplate
    }).exec();

    if (!orderTemplate) {
      this.throw(404);
    }

    this.locals.orderTemplate = this.params.orderTemplate;

    // this order is not saved anywhere,
    // it's only used to initially fill the form
    // order.isNew = true!
    this.order = Order.createFromTemplate(orderTemplate, {
      module: 'getpdf',
      email: Math.round(Math.random()*1e6).toString(36) + '@gmail.com'
    });

  }

  this.locals.order = this.order;

  this.locals.paymentMethods = require('../paymentMethods').methods;

  this.render(__dirname, 'main');
};
