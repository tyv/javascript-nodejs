const config = require('config')
const paypalConfig = config.payments.modules.paypal;
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const TransactionLog = require('../../models/transactionLog');
const log = require('js-log')();
const request = require('koa-request');

// docs:
//
// https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/

log.debugOn();

/* jshint -W106 */
exports.post = function* (next) {

  yield* this.loadTransaction('invoice', {skipOwnerCheck: true});

  yield this.transaction.logRequest('ipn-request unverified', this.request);

  var qs = {
    'cmd': '_notify-validate'
  };

  for (var field in this.req.body) {
    qs[field] = this.req.body[field];
  }

  // request oauth token
  var options = {
    method: 'GET',
    qs:     qs,
    url:    'https://www.paypal.com/cgi-bin/webscr'
  };


  yield this.transaction.log('request ipn verify', options);

  var response;
  try {
    response = yield request(options);
  } catch(e) {
    yield this.transaction.log('request ipn verify failed', e.message);
    this.throw(403, "Couldn't verify ipn");
  }

  if (response.body != "VERIFIED") {
    this.throw(403, "Invalid IPN");
  }

  // ipn is verified now! But we check if it's data matches the transaction (as recommended in docs)
  if (this.transaction.amount != parseFloat(this.req.body.mc_gross) ||
    this.req.body.receiver_email != paypalConfig.email ||
    this.req.body.mc_currency != config.payments.currency) {

    yield this.transaction.persist({
      status:        Transaction.STATUS_FAIL,
      statusMessage: "данные транзакции не совпадают с базой, свяжитесь с поддержкой"
    });
    this.throw(404, "transaction data doesn't match the POST body");
  }

  // match agains latest ipn in logs as recommended:
  // if there was an IPN about the same transaction, and it's state is the same
  //   => then the current one is a duplicate

  var previousIpn = yield TransactionLog.findOne({
    event: "ipn",
    transaction: this.transaction._id
  }).sort({created: -1}).exec();

  if (previousIpn && previousIpn.data.payment_status == this.req.body.payment_status) {
    yield this.transaction.log("ipn duplicate", this.req.body);
    // ignore duplicate
    this.body = '';
    return;
  }

  // now we have a valid non-duplicate IPN, let's update the transaction

  // log it right now to evade conflicts with duplicates
  yield this.transaction.log("ipn", this.req.body);

  // Do not perform any processing on WPS transactions here that do not have
  // transaction IDs, indicating they are non-payment IPNs such as those used
  // for subscription signup requests.
  if (!this.req.body.txn_id) {
    yield this.transaction.log("ipn without txn_id", this.req.body);
    this.body = '';
    return;
  }

  switch(this.req.body.payment_status) {
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
      statusMessage: this.req.body.pending_reason
    });
    this.body = '';
    return;
  case 'Completed':
    yield this.transaction.persist({
      status: Transaction.STATUS_SUCCESS
    });

    yield* require(this.order.module).onSuccess(this.order);
    this.body = '';
    return;
  default:
    // Refunded ...
    yield this.transaction.log("ipn payment_status unknown", this.req.body);

    this.body = '';
    return;
  }



};
