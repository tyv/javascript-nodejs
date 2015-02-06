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

  // Variants:
  //  Order.STATUS == Pending / Failed / Success
  //    if pending && exists pending_online TX show "wait"

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
    var pendingOnlineTransaction = yield Transaction.findOne({
      order: this.order._id,
      status: Transaction.STATUS_PENDING_ONLINE
    }).exec();

    if (pendingOnlineTransaction) {
      this.locals.transaction = pendingOnlineTransaction;
      this.body = this.render('pendingOnline');
      return;
    }

    var pendingOfflineTransaction = yield Transaction.findOne({
      order: this.order._id,
      status: Transaction.STATUS_PENDING_OFFLINE
    }).exec();

    if (pendingOfflineTransaction) {
      this.locals.transaction = pendingOfflineTransaction;
      this.body = this.render('pendingOffline');
      return;
    }


  }


  switch (lastTransaction.status) {
    case Transaction.STATUS_SUCCESS:
      // the order is not yet successful, but the last transaction is successful,
      // that's possible if order.onSuccess hook has not yet finished
      // let's wait a little bit
      this.locals.status = Transaction.STATUS_PENDING_ONLINE;
      this.body = this.render('pending');
      break;
    case Transaction.STATUS_PENDING_OFFLINE:
      this.locals.status = Transaction.STATUS_PENDING_OFFLINE;
      this.locals.paymentInfo = lastTransaction.statusMessage;
      break;
    case Transaction.STATUS_PENDING_ONLINE:
      this.locals.status = Transaction.STATUS_PENDING_ONLINE;
      this.locals.statusMessage = "Ожидаем ответа от системы оплаты...";
      break;
    case Transaction.STATUS_FAIL:
      this.locals.status = Transaction.STATUS_FAIL;
      this.locals.statusMessage =  'Оплата не прошла.';

      if (lastTransaction.statusMessage) {
        this.locals.statusMessage += '<div>' + escapeHtml(lastTransaction.statusMessage) + '</div>';
      }
      break;
    }
  }

  this.body = this.render('order');
};
