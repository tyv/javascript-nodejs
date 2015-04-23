const Transaction = require('../../models/transaction');
const Order = require('../../models/order');
const request = require('koa-request');
const config = require('config');
const qs = require('querystring');

// /payments/paypal/success?transactionNumber=1481381892&tx=76G37726XX923073E&st=Completed&amt=1%2e00&cc=RUB&cm=&item_number=
exports.get = function* (next) {
  yield* this.loadTransaction();

  yield this.transaction.log('success: return', this.originalUrl);

  // trust only tx parameter (transaction token), other params can be user-generated
  // ask the details from Paypal
  var tx = this.query.tx;

  // Verify the success url as explained here:
  // https://developer.paypal.com/docs/classic/paypal-payments-standard/integration-guide/paymentdatatransfer/
  var options = {
    method: 'POST',
    url:    'https://www.paypal.com/cgi-bin/webscr',
    form: {
      cmd: '_notify-synch',
      tx: tx,
      at: config.payments.modules.paypal.pdtToken
    },
    headers: {
      'User-Agent': 'request'
    }
  };

  yield this.transaction.log('success: request verify', options);

  var response;
  try {
    response = yield request(options);
  } catch(e) {
    yield this.transaction.log('success: request verify failed, error', e.message);
    this.throw(403, "Couldn't verify success");
  }

  if (response.body.startsWith("FAIL")) {
    yield this.transaction.log('success: request verify failed', response.body);
    this.throw(403, "Verification Failed");
  } else if (!response.body.startsWith("SUCCESS")) {
    // if it's not fail, must be success (error otherwise)
    yield this.transaction.log('success: request verify error', response.body);
    this.throw(500, "Verification Error");
  } else {
    yield this.transaction.log('success: request verify success', response.body);
  }

  // turn response into query string
  var queryString = response.body.replace(/\n/g, '&');
  var responseParsed = qs.parse(queryString);

  // don't actually need to check it, but still checking that the amount is correct
  // that's an extra check for validity
  if (responseParsed.mc_gross != this.transaction.amount) {
    yield this.transaction.log('success: request but mc_gross != transaction.amount', response.body);
    this.throw(500, "Verification amount error");
  }

  // ...Verified

  // Now let's see if the transaction was already processed by IPN
  var refreshedTransaction = yield Transaction.findOne({
    _id:                        this.transaction._id
  }).exec();

  if (refreshedTransaction.status == Transaction.STATUS_SUCCESS) {
    // done :)
    yield this.transaction.log("success: transaction is already processed by IPN");
  } else {

    yield refreshedTransaction.persist({
      status:        Transaction.STATUS_SUCCESS,
      statusMessage: 'Paypal подтвердил оплату'
    });

    yield this.order.persist({
      status: Order.STATUS_PAID
    });


    this.log.debug("will call order onPaid module=" + this.order.module);
    yield* require(this.order.module).onPaid(this.order);
  }

  this.redirectToOrder();
};

