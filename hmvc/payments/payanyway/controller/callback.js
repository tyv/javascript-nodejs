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

  yield this.transaction.logRequest('callback', this.request);

  // signature is valid, so everything MUST be fine
  if (this.transaction.amount != parseFloat(this.request.body.MNT_AMOUNT) ||
    this.request.body.MNT_ID != config.payments.modules.payanyway.id) {
    yield this.transaction.persist({
      status: Transaction.STATUS_FAIL,
      statusMessage: "данные транзакции не совпадают с базой, свяжитесь с поддержкой"
    });
    this.throw(404, "transaction data doesn't match the POST body");
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
