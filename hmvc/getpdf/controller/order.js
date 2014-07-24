const payments = require('payments');
var Order = payments.Order;
var Transaction = payments.Transaction;

exports.get = function*(next) {

  if (this.params.orderNumber) {
    yield* this.loadOrder();
  } else {

    // this order is not saved anywhere,
    // it's only used to initially fill the form
    this.order = new Order({
      amount: 1,
      module: 'getpdf',
      data: {
        email: Math.round(Math.random()*1e6).toString(36) + '@gmail.com'
      }
    });

  }

  this.locals.order = this.order;

  var lastTransaction = yield Transaction.findOne({ order: this.order._id }).sort({created: -1}).exec();

  if (lastTransaction) {
    console.log(lastTransaction.getStatusDescription);
    this.locals.message = 'Статус последней оплаты: ' + lastTransaction.getStatusDescription();
  }

  this.locals.paymentMethods = require('../paymentMethods').methods;

  this.render(__dirname, 'main');
};
