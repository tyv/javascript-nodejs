const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;

exports.get = function*(next) {
  this.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  var lastTransaction;
  if (this.params.orderNumber) {
    yield* this.loadOrder();

    var lastTransaction = yield Transaction.findOne({ order: this.order._id }).sort({created: -1}).exec();
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

  if (lastTransaction) {
    console.log(lastTransaction.getStatusDescription);
    this.locals.message = 'Статус последней оплаты: ' + lastTransaction.getStatusDescription();
  }

  this.locals.paymentMethods = require('../paymentMethods').methods;

  this.render(__dirname, 'main');
};
