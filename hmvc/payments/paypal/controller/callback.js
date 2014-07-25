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

  yield this.transaction.logRequest('ipn-unverified', this.request);

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
  if (this.transaction.amount != parseFloat(this.request.body.mc_gross) ||
    this.request.body.receiver_email != paypalConfig.email ||
    this.request.body.mc_currency != config.payments.currency) {

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

  if (previousIpn && previousIpn.data.payment_status == this.request.body.payment_status) {
    yield this.transaction.logRequest("ipn duplicate", this.request);
    // ignore duplicate
    this.body = '';
    return;
  }

  // now we have a valid non-duplicate IPN, let's update the transaction

  // log it right now to evade conflicts with duplicates
  yield this.transaction.log("ipn", this.request.body);

  // Do not perform any processing on WPS transactions here that do not have
  // transaction IDs, indicating they are non-payment IPNs such as those used
  // for subscription signup requests.
  if (!this.request.body.txn_id) {
    this.body = '';
    return;
  }

  // Exit when we don't get a payment status we recognize

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
    yield this.transaction.persist({
      status: Transaction.STATUS_SUCCESS
    });

    yield* require(this.order.module).onSuccess(this.order);
    this.body = '';
    return;
  default:
    yield this.transaction.logRequest("ipn status ignored", this.request);

    this.body = '';
    return;
  }



};
