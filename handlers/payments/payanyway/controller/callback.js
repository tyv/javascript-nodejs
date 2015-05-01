const config = require('config');
//require('config/mongoose');
const payanywayConfig = config.payments.modules.payanyway;
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const md5 = require('MD5');

exports.post = function* (next) {

  yield* this.loadTransaction('MNT_TRANSACTION_ID', {skipOwnerCheck : true});


  yield this.transaction.logRequest('callback unverified', this.request);

  if (!checkSignature(this.request.body)) {
    this.log.debug("wrong signature");
    this.throw(403, "wrong signature");
  }

  yield this.transaction.logRequest('callback', this.request);

  // signature is valid, so everything MUST be fine
  if (this.transaction.amount != parseFloat(this.request.body.MNT_AMOUNT) ||
    this.request.body.MNT_ID != payanywayConfig.id) {
    yield this.transaction.persist({
      status: Transaction.STATUS_FAIL,
      statusMessage: "данные транзакции не совпадают с базой, свяжитесь с поддержкой"
    });
    this.throw(404, "transaction data doesn't match the POST body");
  }

  yield this.transaction.persist({
    status: Transaction.STATUS_SUCCESS
  });

  this.log.debug("will call order onPaid module=" + this.order.module);
  yield* this.order.onPaid();

  this.body = 'SUCCESS';
};

function checkSignature(body) {

  var signature = body.MNT_ID + body.MNT_TRANSACTION_ID + body.MNT_OPERATION_ID + body.MNT_AMOUNT +
    body.MNT_CURRENCY_CODE + (body.MNT_SUBSCRIBER_ID || '') + (+body.MNT_TEST_MODE ? '1' : '0') + payanywayConfig.secret;

  signature = md5(signature);

  return signature == body.MNT_SIGNATURE;
}
