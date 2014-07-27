const config = require('config');
//require('config/mongoose');
const payanywayConfig = config.payments.modules.payanyway;
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const log = require('js-log')();
const md5 = require('MD5');

log.debugOn();

exports.post = function* (next) {

  checkSignature(this.request.body);
  this.body = 'SUCCESS';
  return;

  yield* this.loadTransaction('MNT_TRANSACTION_ID', {skipOwnerCheck : true});


  yield this.transaction.logRequest('callback unverified', this.request);

  if (!checkSignature(this.request.body)) {
    log.debug("wrong signature");
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

  var order = this.order;
  log.debug("will call order onSuccess module=" + order.module);
  yield* require(order.module).onSuccess(order);

  this.body = 'SUCCESS';
};

function checkSignature(body) {

  var signature = body.MNT_ID + body.MNT_TRANSACTION_ID + body.MNT_AMOUNT +
    body.MNT_CURRENCY_CODE + (body.MNT_SUBSCRIBER_ID || '') + (+body.MNT_TEST_MODE ? '1' : '0') + payanywayConfig.secret;

  console.log(signature);
  signature = md5(signature);

  console.log(signature);
  return signature == body.MNT_SIGNATURE;
}

/*
var body ={ MNT_ID: '31873866',
 MNT_TRANSACTION_ID: '12',
 MNT_OPERATION_ID: '55923826',
 MNT_AMOUNT: '1.00',
 MNT_CURRENCY_CODE: 'RUB',
 MNT_TEST_MODE: '0',
 MNT_SIGNATURE: 'ebf8d4b9fa10301b858cc314b356cc41',
 'paymentSystem.unitId': '822360',
 MNT_CORRACCOUNT: '15598507',
 qiwiphone: '9035419441' }

console.log(+checkSignature(body));
*/
