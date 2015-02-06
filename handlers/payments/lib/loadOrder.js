var mongoose = require('mongoose');
var Order = require('../models/order');
var assert = require('assert');

// Populates this.order with the order by "orderNumber" parameter
module.exports = function* (options) {
  options = options || {};

  var field = options.field || 'orderNumber';

  var orderNumber = this.request.body && this.request.body[field] || this.params[field] || this.query[field];

  if (!orderNumber) {
    return;
  }

  var order = yield Order.findOne({number: orderNumber}).populate('user').exec();

  if (!order) {
    this.throw(404, 'Нет такого заказа');
  }


  var belongsToUser = this.req.user && this.req.user._id == order.user;

  var orderInSession = this.session.orders && this.session.orders.indexOf(order.number) != -1;

  // allow to load order which belongs to the user or in the current session
  if (process.env.NODE_ENV != 'development' && !orderInSession && !belongsToUser) {
    this.throw(403, 'Заказ отсутствует в текущей сессии');
  }

  if (!options.reload) {
    // the order must have not yet been loaded from the user data
    assert(!this.order, "this.order is already set (by loadTransaction?)");
  }

  this.log.debug("order", order.toObject());

  this.order = order;

};
