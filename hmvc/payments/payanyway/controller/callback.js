const config = require('config');
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();

exports.post = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID', {skipOwnerCheck : true});

  if (!checkSignature(this.request.body)) {
    log.debug("wrong signature");
    this.throw(403, "wrong signature");
  }

  yield this.transaction.log({
    event: 'callback',
    data:  {url: this.request.originalUrl, body: this.request.body}
  });

  if (this.transaction.amount != parseFloat(this.request.body.MNT_AMOUNT) ||
    this.request.body.MNT_ID != config.payments.modules.payanyway.id) {
    this.throw(404, 'transaction with given params not found');
  }

  yield this.transaction.persist({
    status: Transaction.STATUS_SUCCESS
  });

  var order = this.order;
  log.debug("will call order onSuccess module=" + order.module);
  yield* require(order.module).onSuccess(order);

  this.body = 'SUCCESS';
};

function checkSignature(body) {

  var signature = md5(body.MNT_ID + body.MNT_TRANSACTION_ID + body.MNT_OPERATION_ID +
    body.MNT_AMOUNT + body.MNT_CURRENCY_CODE + body.MNT_SUBSCRIBER_ID + body.MNT_TEST_MODE +
    config.payments.modules.payanyway.secret).toUpperCase();

  return signature == body.MNT_SIGNATURE;
}
