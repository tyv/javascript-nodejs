const payment = require('../../payment');
const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('javascript-log')(module);
const md5 = require('MD5');

log.debugOn();

exports.prerequest = function* (next) {

  log.debug("prerequest");

  var transaction = yield Transaction.findOne({number: this.request.body.LMI_PAYMENT_NO}).exec();

  if (!transaction) {
    log.debug("no transaction " + this.request.body.LMI_PAYMENT_NO);
    this.throw(404, 'transaction not found');
  }

  yield new TransactionLog().persist({
    transaction: transaction._id,
    event:       'prerequest',
    data:        JSON.stringify(this.request.body)
  });

  if (transaction.status == Transaction.STATUS_SUCCESS ||
    transaction.amount != parseFloat(this.request.body.LMI_PAYMENT_AMOUNT) ||
    this.request.body.LMI_PAYEE_PURSE != config.webmoney.purse
    ) {
    log.debug("no pending transaction " + this.request.body.LMI_PAYMENT_NO);
    this.throw(404, 'unfinished transaction with given params not found');
  }

  this.body = 'YES';

};

exports.post = function* (next) {

  if (this.request.body.LMI_PREREQUEST == '1') {
    yield exports.prerequest.call(this, next);
    return;
  }

  if (!checkSign(this.request.body)) {
    log.debug("wrong signature");
    this.throw(403, "wrong signature");
  }

  var transaction = yield Transaction.findOne({number: this.request.body.LMI_PAYMENT_NO}).exec();

  if (!transaction) {
    this.throw(404, 'transaction not found');
  }

  yield new TransactionLog().persist({
    transaction: transaction._id,
    event:       'result',
    data:        JSON.stringify(this.request.body)
  });

  if (transaction.amount != parseFloat(this.request.body.LMI_PAYMENT_AMOUNT) ||
    this.request.body.LMI_PAYEE_PURSE != config.webmoney.purse) {
    this.throw(404, 'transaction with given params not found');
  }

  if (!this.request.body.LMI_SIM_MODE || this.request.body.LMI_SIM_MODE == '0') {
    transaction.status = Transaction.STATUS_SUCCESS;
    yield transaction.persist();
  }

  this.body = 'OK';

};

function checkSign(body) {

  var signature = md5(body.LMI_PAYEE_PURSE + body.LMI_PAYMENT_AMOUNT + body.LMI_PAYMENT_NO +
    body.LMI_MODE + body.LMI_SYS_INVS_NO + body.LMI_SYS_TRANS_NO + body.LMI_SYS_TRANS_DATE +
    config.webmoney.secretKey + body.LMI_PAYER_PURSE + body.LMI_PAYER_WM).toUpperCase();

  return signature == body.LMI_HASH;
}
