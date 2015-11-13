const config = require('config')
const paypalConfig = config.payments.modules.paypal;
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const TransactionLog = require('../../models/transactionLog');
const request = require('koa-request');

// docs:
//
// https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/

/* jshint -W106 */
exports.post = function* (next) {

  yield* this.loadTransaction('invoice', {skipOwnerCheck: true});


  yield this.transaction.logRequest('ipn: request received', this.request);


  var qs = {
    'cmd': '_notify-validate'
  };

  for (var field in this.request.body) {
    qs[field] = this.request.body[field];
  }

  // request oauth token
  var options = {
    method: 'GET',
    qs:     qs,
    url:    'https://www.paypal.com/cgi-bin/webscr',
    headers: {
      'User-Agent': 'request'
    }
  };

  yield this.transaction.log('ipn: request verify', options);

  var response;
  try {
    response = yield request(options);
  } catch(e) {
    yield this.transaction.log('ipn: request verify failed', e.message);
    this.throw(403, "Couldn't verify ipn");
  }

  if (response.body != "VERIFIED") {
    yield this.transaction.log('ipn: invalid IPN', response.body);
    this.throw(403, "Invalid IPN");
  }

  // ipn is verified now! But we check if it's data matches the transaction (as recommended in docs)
  if (this.transaction.amount != parseFloat(this.request.body.mc_gross) ||
    this.request.body.receiver_email != paypalConfig.email ||
    this.request.body.mc_currency != this.transaction.currency) {

    yield this.transaction.log("ipn: the response POST data doesn't match the transaction data", response.body);
    this.throw(404, "transaction data doesn't match the POST body, strange");
  }

  // IPN is fully verified and valid

  // match agains latest ipn in logs as recommended:
  // if there just was an IPN about the same transaction, and it's state is the same
  //   => then the current one is a duplicate
  var previousIpn = yield TransactionLog.findOne({
    event: "ipn: VALIDATED_IN_PROCESS",
    transaction: this.transaction._id
  }).sort({created: -1}).exec();

  if (previousIpn && previousIpn.data.payment_status == this.request.body.payment_status) {
    yield this.transaction.log("ipn: duplicate", this.request.body);
    // ignore duplicate
    this.body = '';
    return;
  }

  yield this.transaction.log("ipn: VALIDATED_IN_PROCESS", this.request.body);

  // IPN is fully verified, valid, non-duplicate

  // Do not perform any processing on WPS transactions here that do not have
  // transaction IDs, indicating they are non-payment IPNs such as those used
  // for subscription signup requests.
  if (!this.request.body.txn_id) {
    yield this.transaction.log("ipn: without txn_id", this.request.body);
    this.body = '';
    return;
  }

  switch(this.request.body.payment_status) {
  case 'Failed':
  case 'Voided':
    yield this.transaction.persist({
      status: Transaction.STATUS_FAIL
    });
    this.body = '';
    return;
  case 'Pending':
    yield this.transaction.persist({
      status: Transaction.STATUS_PENDING,
      statusMessage: this.request.body.pending_reason
    });
    this.body = '';
    return;
  case 'Completed':

    // Now let's see if the transaction was already processed by PDT or another IPN
    var refreshedTransaction = yield Transaction.findOne({
      _id:                        this.transaction._id
    }).exec();

    if (refreshedTransaction.status == Transaction.STATUS_SUCCESS) {
      // done :)
      yield this.transaction.log("ipn: transaction is already processed to success by PDT/IPN");
    } else {

      yield this.transaction.log("ipn: paypal confirmed the payment");

      this.log.debug("will call order onPaid module=" + this.order.module);
      yield* this.order.onPaid(refreshedTransaction);
    }

    this.body = '';
    return;
  default:
    // Refunded ...
    yield this.transaction.log("ipn: payment_status unknown", this.request.body);

    this.body = '';
    return;
  }



};
