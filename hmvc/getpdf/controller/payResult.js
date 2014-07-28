const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;
const escapeHtml = require('escape-html');

/**
 * 3 kinds of response
 * 1) { status, successHtml } - if order success
 * 2) { status, statusMessage(optional) } - if another status
 * 3) "" - empty string if no information
 * @param next
 */
exports.get = function*(next) {
  this.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  yield* this.loadOrder();


  if (this.order.status == Transaction.STATUS_SUCCESS) {
    this.body = {
      status: Transaction.STATUS_SUCCESS,
      html:   'Спасибо за покупку! Вот ваши ништяки.'
    };
    return;
  }


  var lastTransaction = yield Transaction.findOne({ order: this.order._id }).sort({created: -1}).exec();

  // no payment at all?!? strange
  if (!lastTransaction) {
    this.body = {
      status: Transaction.STATUS_FAIL,
      html: 'Оплаты не было.'
    };
    return;
  }

  // the order is not yet successful, but the last transaction is not,
  // that's possible if order.onSuccess hook has not yet finished
  // let's wait a little bit
  if (lastTransaction.status == Transaction.STATUS_SUCCESS) {
    this.body = '';
    return;
  }

  // transaction status unknown
  //  -> it means we're awaiting a response from the payment system
  if (!lastTransaction.status) {
    this.body = '';
    return;
  }

  if (lastTransaction.status == Transaction.STATUS_FAIL) {
    this.body = {
      status: lastTransaction.status,
      html:   'Оплата не прошла.'
    };

    if (lastTransaction.statusMessage) {
      this.body.html += '<div>' + escapeHtml(lastTransaction.statusMessage) + '</div>';
    }
    return;
  }


  if (lastTransaction.status == Transaction.STATUS_PENDING) {
    this.body = {
      status: lastTransaction.status,
      html:   'Оплата ожидается.'
    };

    if (lastTransaction.statusMessage) {
      this.body.html += '<div>' + escapeHtml(lastTransaction.statusMessage) + '</div>';
    }
  }

};
