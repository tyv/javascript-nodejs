var mongoose = require('mongoose');
var Order = mongoose.models.Order;

module.exports = function(field) {

  if (!field) field = 'orderNumber';

  return function* (next) {

    var orderNumber = this.request.body && this.request.body[field] || this.params[field] || this.query[field];

    if (!orderNumber) {
      return yield* next;
    }

    var order = yield Order.findOne({number: orderNumber}).populate('order').exec();

    if (!order) {
      this.throw(404, 'Нет такого заказа');
    }

    // todo: add belongs to check (with auth)
    if (!this.session.orders || this.session.orders.indexOf(order.number) == -1) {
      this.throw(403, 'Заказ в сессии не найден');
    }

    this.order = order;
    yield* next;
  };
};
