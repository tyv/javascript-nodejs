var mongoose = require('mongoose');
var Order = require('../models/order');
var assert = require('assert');

// Populates this.order with the order by "orderNumber" parameter
module.exports = function* (field) {

  if (!field) field = 'orderNumber';

  var orderNumber = this.request.body && this.request.body[field] || this.params[field] || this.query[field];

  if (!orderNumber) {
    return;
  }

  var order = yield Order.findOne({number: orderNumber}).populate('order').exec();

  if (!order) {
    this.throw(404, 'Нет такого заказа');
  }

  // todo: add belongs to check (with auth)
  if (!this.session.orders || this.session.orders.indexOf(order.number) == -1) {
    this.throw(403, 'Заказ в сессии не найден');
  }


  assert(!this.order, "this.order is already set (by loadTransaction?)");

  this.order = order;

};
