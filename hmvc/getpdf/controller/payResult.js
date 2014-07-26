const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;

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

  // no payment at all? strange
  if (!lastTransaction) {
    this.body = {
      status: Transaction.STATUS_FAIL,
      html:   'Оплаты не было.'
    };
    return;
  }

  // last transaction was successful, but the order is not
  // let's wait a little bit
  if (lastTransaction.status == Transaction.STATUS_SUCCESS) {
    this.body = '';
    this.status = 204; // no content
    return;
  }

  // transaction status unknown -> waiting
  if (!lastTransaction.status) {
    this.body = '';
    this.status = 204; // no content
    return;
  }

  this.body = {
    status: lastTransaction.status,
    html:   lastTransaction.getStatusDescription()
  };

};
