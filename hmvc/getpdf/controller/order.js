var mongoose = require('mongoose');

var Order = mongoose.models.Order;

var methods = require('../paymentMethods').methods;

exports.post = function*(next) {
  this.assertCSRF(this.request.body);

  var method = methods[this.request.body.paymentMethod];
  if (!method) {
    this.throw(403, "Unsupported payment method");
  }

  var methodApi = this.app.hmvc[method.name]; // /hmvc/webmoney

  var order = new Order({
    amount: 1,
    module: 'getpdf',
    data: { }
  });
  yield order.persist();

  if (!this.session.orders) {
    this.session.orders = [];
  }
  this.session.orders.push(order.number);

  var form = yield methodApi.createTransactionForm(order);

  this.body = form;

};
