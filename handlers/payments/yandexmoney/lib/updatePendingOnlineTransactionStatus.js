
const request = require('koa-request');
const Transaction = require('../../models/transaction');
const Order = require('../../models/order');
const assert = require('assert');

// update order status if possible, check transactions
/* jshint -W106 */
module.exports = function*(transaction) {
  assert(transaction.status == Transaction.STATUS_PENDING);

  // to avoid race condition with regular update
  // not really atomic locking, but much safer than w/o it
  if (transaction.paymentDetails.processing) return;
  transaction.paymentDetails.processing = true;
  yield transaction.persist();

  var processPaymentResponse = yield* processPayment(transaction);

  yield function(callback) {
    transaction.populate('order', callback);
  };

  var order = transaction.order;

  switch (processPaymentResponse.status) {
  case 'success':
    transaction.status = Transaction.STATUS_SUCCESS;
    break;

  case 'refused':
    transaction.status = Transaction.STATUS_FAIL;
    transaction.statusMessage = processPaymentResponse.error;
    break;

  case 'in_progress':
    transaction.paymentDetails.nextRetry = Date.now() + processPaymentResponse.next_retry;
    break;

  default:
    this.log.error("Unexprected response from yandex ", processPaymentResponse);
    this.throw(500, "Unexpected response from yandex.money");
  }

  transaction.paymentDetails.processing = false;

  yield transaction.persist();

  if (transaction.status == Transaction.STATUS_SUCCESS) {
    // success!

    yield* order.onPaid();

  }

};


function* processPayment(transaction) {
  var options = {
    method:  'POST',
    form:    {
      request_id: transaction.paymentDetails.requestId
    },
    headers: {
      'Authorization': 'Bearer ' + transaction.paymentDetails.oauthToken
    },
    url:     'https://money.yandex.ru/api/process-payment'
  };

  yield* transaction.log('request api/process-payment', options);

  var response = yield request(options);
  yield* transaction.log('response api/process-payment', response.body);

  return JSON.parse(response.body);
}

