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

  this.log.debug("will call order onPaid module=" + this.order.module);
  yield* this.order.onPaid(this.transaction);

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

  signature.push(interkassaConfig.secret);

  signature = signature.join(':');

  signature = new Buffer(md5(signature, {asBytes: true})).toString('base64');

  return signature == incomingSignature;
}
