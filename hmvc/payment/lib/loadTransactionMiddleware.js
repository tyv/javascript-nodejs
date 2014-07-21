var mongoose = require('mongoose');
var Transaction = mongoose.models.Transaction;
var log = require('js-log')();

log.debugOn();

module.exports = function(field) {

  if (!field) field = 'transactionNumber';

  return function* (next) {

    var transactionNumber = this.request.body && this.request.body[field] || this.params[field] || this.query[field];

    log.debug('tx number: ' + transactionNumber);
    if (!transactionNumber) {
      return yield* next;
    }

    var transaction = yield Transaction.findOne({number: transactionNumber}).populate('order').exec();

    if (!transaction) {
      this.throw(404, 'Нет такой транзакции');
    }

    // todo: add belongs to check (with auth)
    console.log("NUM", transaction.order.number, this.session);
    if (!this.session.orders || this.session.orders.indexOf(transaction.order.number) == -1) {
      this.throw(403, 'Не найден заказ в сессии для этой транзакции');
    }

    this.transaction = transaction;
    yield* next;
  };
};
