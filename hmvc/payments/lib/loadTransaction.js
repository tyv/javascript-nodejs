var mongoose = require('mongoose');
var Transaction = require('../models/transaction');
var log = require('js-log')();
var assert = require('assert');

// Populates this.transaction with the transaction by "transactionNumber" parameter
// options.skipOwnerCheck is for signed submissions, set to true allows anyone to load transaction
module.exports = function* (field, options) {
  options = options || {};
  if (!field) field = 'transactionNumber';

  var transactionNumber = this.req.body && this.req.body[field] || this.params[field] || this.query[field];

  log.debug('tx number: ' + transactionNumber);
  if (!transactionNumber) {
    return;
  }

  var transaction = yield Transaction.findOne({number: transactionNumber}).populate('order').exec();

  if (!transaction) {
    this.throw(404, 'Нет такой транзакции');
  }

  if (!options.skipOwnerCheck) {
    // todo: add belongs to check (with auth)
    if (!this.session.orders || this.session.orders.indexOf(transaction.order.number) == -1) {
      this.throw(403, 'Не найден заказ в сессии для этой транзакции');
    }
  }

  assert(!this.transaction, "this.transaction is already set");
  assert(!this.order, "this.order is already set");

  this.transaction = transaction;
  this.order = transaction.order;

};
