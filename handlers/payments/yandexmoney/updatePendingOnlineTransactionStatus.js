/* jshint -W106 */

const request = require('koa-request');
const Transaction = require('../models/transaction');

// update order status if possible, check transactions
module.exports = function*(transaction) {
  if (transaction.status != Transaction.STATUS_PENDING_ONLINE) return;

  var processPaymentResponse = yield* processPayment(transaction);

  yield function(callback) {
    transaction.populate('order', callback);
  };

  var order = transaction.order;

  switch (processPaymentResponse.status) {
  case 'success':
    // success!
    var orderModule = require(order.module);
    yield* orderModule.onSuccess(order);

    return;

  case 'ext_auth_required':
    // never happens cause we don't use bank cards?
  case 'refused':
    transaction.status = Transaction.STATUS_FAIL;
    transaction.statusMessage = processPaymentResponse.error;
    yield transaction.persist();
    return;
  case 'in_progress':
    return processPaymentResponse.next_retry;
  default:
    return 1000;
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

