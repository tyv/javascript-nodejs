const config = require('config');
const interkassaConfig = config.payments.modules.interkassa;
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const md5 = require('MD5');

exports.post = function* (next) {

  yield* this.loadTransaction('ik_pm_no', {skipOwnerCheck: true});

  yield this.transaction.logRequest('callback unverified', this.request);

  if (!checkSignature(this.request.body)) {
    this.log.debug("wrong signature");
    this.throw(403, "wrong signature");
  }

  yield this.transaction.logRequest('callback', this.request);

  yield this.transaction.persist({
    status: Transaction.STATUS_SUCCESS
  });

  yield this.order.persist({
    status: Order.STATUS_PAID
  });

  var order = this.order;
  this.log.debug("will call order onPaid module=" + order.module);
  yield* require(order.module).onPaid(order);

  this.body = 'SUCCESS';
};

// Base64(MD5(Implode(Sort(Params) + SecretKey, ':')))
// Implode(Sort(Params) + SecretKey, ':')
// Sort(Params) + SecretKey
function checkSignature(body) {

  var incomingSignature = body.ik_sign;

  var signature = Object.keys(body)
    .filter(function(key) {
      return key != 'ik_sign';
    })
    .sort()
    .map(function(key) {
      return body[key];
    });

  console.log(signature);
  signature.push(interkassaConfig.secret);

  console.log(signature);

  signature = signature.join(':');

  console.log(signature);

  signature = new Buffer(md5(signature, {asBytes: true})).toString('base64');

  console.log(signature, '==', incomingSignature);

  return signature == incomingSignature;
}
