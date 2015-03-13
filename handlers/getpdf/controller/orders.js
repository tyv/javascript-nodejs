const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;
var assert = require('assert');


// Existing order page
exports.get = function*() {

  yield* this.loadOrder({
    ensureSuccessTimeout: 5000
  });

  this.nocache();

  this.locals.sitetoolbar = true;
  this.locals.title = 'Заказ №' + this.order.number;

  this.locals.order = this.order;

  this.locals.user = this.req.user;

  this.locals.paymentMethods = {};
  for(var key in payments.methods) {
    this.locals.paymentMethods[key] = { name: key, title: payments.methods[key].title };
  }

  if (this.order.status == Order.STATUS_SUCCESS) {
    yield* renderSuccess.call(this);
    return;
  }

  if (this.order.status == Order.STATUS_PENDING) {
    yield* renderPending.call(this);
  }

  if (this.order.status == Order.STATUS_CANCEL) {
    this.throw(403, "The order was canceled");
  }

};


function* renderSuccess() {

  var successfulTansaction = yield Transaction.findOne({
    order: this.order._id,
    status: Transaction.STATUS_SUCCESS
  }).exec();

  // to show in receipt, maybe no transaction, just success status (set manually)
  if (successfulTansaction) {
    this.locals.transaction = successfulTansaction;
  }

  this.body = this.render('success');

}

function* renderPending() {

  // try to find a success transaction
  // it is possible that it is not the last one
  // e.g. the user chooses method 1, then method 2 (tx 1 cancelled, but he doesn't care!), then pays method 1
  var successfulTansaction = yield Transaction.findOne({
    order: this.order._id,
    status: Transaction.STATUS_SUCCESS
  }).exec();

  // PENDING order, but Transaction.STATUS_SUCCESS?
  // means that order onSuccess failed to finalize the job
  // (we must have given it the time in reloadOrderUntilSuccessFinish)
  if (successfulTansaction) {
    this.locals.transaction = successfulTansaction;
    this.body = this.render('order');
    return;
  }

  // NO CALLBACK from online-system, but the user is back?
  // probably he just pressed the "back" button
  // and didn't pay
  var pendingTransaction = yield Transaction.findOne({
    order: this.order._id,
    status: Transaction.STATUS_PENDING_ONLINE
  }).exec();

  this.log.debug("findOne pending transaction: ", pendingTransaction && pendingTransaction.toObject());

  if (pendingTransaction) {
    this.locals.transaction = pendingTransaction;
    this.body = this.render('order');
    return;
  }

  // INPROGRESS callback from online system, or a pre-selected offline method
  // let's show him we're waiting
  var pendingOfflineTransaction = yield Transaction.findOne({
    order: this.order._id,
    status: Transaction.STATUS_PENDING_OFFLINE
  }).exec();


  this.log.debug("findOne pending transaction: ", pendingOfflineTransaction && pendingOfflineTransaction.toObject());

  if (pendingOfflineTransaction) {
    this.locals.transaction = pendingOfflineTransaction;
    this.body = this.render('pending');
    return;
  }

  // Failed?
  // Show the error and let him pay
  var failedTransaction = yield Transaction.findOne({
    order:  this.order._id,
    status: Transaction.STATUS_FAIL
  }).sort({created: -1}).exec();

  this.log.debug("findOne failed transaction: ", failedTransaction && failedTransaction.toObject());

  this.locals.transaction = failedTransaction;
  this.body = this.render('order');

}
