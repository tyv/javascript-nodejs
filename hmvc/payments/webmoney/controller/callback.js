const config = require('config');
const mongoose = require('mongoose');
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();

// ONLY ACCESSED from WEBMONEY SERVER
exports.prerequest = function* (next) {
  yield* this.loadTransaction('LMI_PAYMENT_NO', {skipOwnerCheck : true});

  log.debug("prerequest");

  yield this.transaction.log({
    event: 'prerequest',
    data:  {url: this.request.originalUrl, body: this.request.body}
  });

  if (this.transaction.status == Transaction.STATUS_SUCCESS ||
    this.transaction.amount != parseFloat(this.request.body.LMI_PAYMENT_AMOUNT) ||
    this.request.body.LMI_PAYEE_PURSE != config.webmoney.purse
    ) {
    log.debug("no pending transaction " + this.request.body.LMI_PAYMENT_NO);
    this.throw(404, 'unfinished transaction with given params not found');
  }

  this.body = 'YES';

};

exports.post = function* (next) {

  yield* this.loadTransaction('LMI_PAYMENT_NO', {skipOwnerCheck : true});

  if (!checkSignature(this.request.body)) {
    log.debug("wrong signature");
    this.throw(403, "wrong signature");
  }

  yield this.transaction.log({
    event: 'result',
    data:  {url: this.request.originalUrl, body: this.request.body}
  });

  if (this.transaction.amount != parseFloat(this.request.body.LMI_PAYMENT_AMOUNT) ||
    this.request.body.LMI_PAYEE_PURSE != config.webmoney.purse) {
    this.throw(404, 'transaction with given params not found');
  }

  if (!this.request.body.LMI_SIM_MODE || this.request.body.LMI_SIM_MODE == '0') {
    this.transaction.status = Transaction.STATUS_SUCCESS;
    yield this.transaction.persist();
  }

  var order = this.transaction.order;
  log.debug("will call order onSuccess module=" + order.module);
  yield* require(order.module).onSuccess(order);

  this.body = 'OK';

};

function checkSignature(body) {

  var signature = md5(body.LMI_PAYEE_PURSE + body.LMI_PAYMENT_AMOUNT + body.LMI_PAYMENT_NO +
    body.LMI_MODE + body.LMI_SYS_INVS_NO + body.LMI_SYS_TRANS_NO + body.LMI_SYS_TRANS_DATE +
    config.webmoney.secretKey + body.LMI_PAYER_PURSE + body.LMI_PAYER_WM).toUpperCase();

  return signature == body.LMI_HASH;
}
