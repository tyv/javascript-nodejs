const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;
var escapeHtml = require('escape-html');
var assert = require('assert');

// Existing order page
exports.get = function*() {
  this.nocache();

  yield* this.loadOrder();

  this.locals.sitetoolbar = true;
  this.locals.title = 'Заказ №' + this.order.number;

  this.locals.order = this.order;

  this.locals.user = this.req.user;

  this.locals.paymentMethods = {};
  for(var key in payments.methods) {
    this.locals.paymentMethods[key] = { name: key, title: payments.methods[key].title };
  }

  if (this.order.status == Order.STATUS_SUCCESS) {

    var successfulTansaction = yield Transaction.findOne({
      order: this.order._id,
      status: Transaction.STATUS_SUCCESS
    }).exec();

    // to show in receipt, maybe no transaction, just success status (set manually)
    if (successfulTansaction) {
      this.locals.transaction = successfulTansaction;
    }

    this.body = this.render('success');
    return;
  }

  if (this.order.status == Order.STATUS_PENDING) {
    var pendingTransaction = yield Transaction.findOne({
      order: this.order._id,
      status: {
          $in: [Transaction.STATUS_PENDING_ONLINE, Transaction.STATUS_PENDING_OFFLINE]
      }
    }).exec();

    this.log.debug("findOne pending transaction: ", pendingTransaction && pendingTransaction.toObject());

    if (pendingTransaction) {
      this.locals.transaction = pendingTransaction;

      this.body = this.render('pending');
      return;
    }

    var failedTransaction = yield Transaction.findOne({
      order:  this.order._id,
      status: Transaction.STATUS_FAIL
    }).sort({created: -1}).exec();

    this.log.debug("findOne failed transaction: ", failedTransaction && failedTransaction.toObject());

    this.locals.transaction = failedTransaction;
    this.body = this.render('order');
    return;
  }

  if (this.order.status == Order.STATUS_CANCEL) {
    this.throw(403, "The order was canceled");
  }

};
