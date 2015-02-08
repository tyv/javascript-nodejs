const config = require('config');
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const request = require('koa-request');


var updatePendingOnlineTransactionStatus = require('../lib/updatePendingOnlineTransactionStatus');

/* jshint -W106 */
exports.get = function* () {

  var self = this;

  yield* this.loadTransaction();

  yield this.transaction.logRequest('back', this.request);

  if (!this.query.code) {
    yield* fail(this.query.error_description || this.query.error);
    return;
  }

  try {
    var oauthTokenResponse = yield* requestOauthToken.call(this, this.query.code);

    var oauthToken = oauthTokenResponse.access_token;

    if (!oauthToken) {
      throwResponseError(oauthTokenResponse);
    }

    var requestPaymentResponse = yield* requestPayment.call(this, oauthToken);

    if (requestPaymentResponse.status != "success") {
      if (requestPaymentResponse.error == 'ext_action_required') {
        self.redirect(requestPaymentResponse.ext_action_uri);
        return;
      }

      throwResponseError(requestPaymentResponse);
    }

    // payment approved, success
    this.transaction.paymentDetails.oauthToken = oauthToken;
    this.transaction.paymentDetails.requestId = requestPaymentResponse.request_id;
    yield this.transaction.persist();

    // payment may not succeed yet,
    // so this can be called later too with HTTP GET
    yield* updatePendingOnlineTransactionStatus(this.transaction);

    self.redirectToOrder();

  } catch (e) {
    if (e instanceof URIError) {
      yield* fail(e.message);
      return;
    } else if (e instanceof SyntaxError) {
      yield* fail("некорректный ответ платёжной системы");
      return;
    } else {
      throw e;
    }
  }

  /* jshint -W106 */
  function* fail(reason) {
    self.transaction.status = Transaction.STATUS_FAIL;
    self.transaction.statusMessage = reason;

    console.log(self.transaction.toObject());
    yield self.transaction.persist();

    console.log("???");
    self.redirectToOrder();
  }



};



function* requestOauthToken(code) {

  // request oauth token
  var options = {
    method: 'POST',
    form:   {
      code:          code,
      client_id:     config.payments.modules.yandexmoney.clientId,
      grant_type:    'authorization_code',
      redirect_uri:  config.payments.modules.yandexmoney.redirectUri + '?transactionNumber=' +
        this.transaction.number,
      client_secret: config.payments.modules.yandexmoney.clientSecret
    },
    url:    'https://sp-money.yandex.ru/oauth/token'
  };


  yield this.transaction.log('request oauth/token', options);

  var response = yield request(options);

  yield this.transaction.log('response oauth/token', response.body);

  return JSON.parse(response.body);
}


// request payment
// return return request_id
function* requestPayment(oauthToken) {
  var options = {
    method:  'POST',
    form:    {
      pattern_id:      'p2p',
      to:              config.payments.modules.yandexmoney.purse,
      amount:          this.transaction.amount,
      comment:         'оплата по счету ' + this.transaction.number,
      message:         'оплата по счету ' + this.transaction.number,
      identifier_type: 'account'
    },
    headers: {
      'Authorization': 'Bearer ' + oauthToken
    },
    url:     'https://money.yandex.ru/api/request-payment'
  };

  this.log.debug('request api/request-payment', options);
  yield this.transaction.log('request api/request-payment', options);

  var response = yield request(options);
  this.log.debug('response api/request-payment', response.body);
  yield this.transaction.log('response api/request-payment', response.body);

  return JSON.parse(response.body);
}


function throwResponseError(response) {
  var message;

  var error = (response.error == 'not_enough_funds') ? 'недостаточно средств.' :
    (response.error == 'limit_exceeded') ? 'превышен лимит.' :
    (response.error == 'account_blocked') ? 'счёт заблокирован.' : response.error;

  if (error && response.error_description) {
    message = '[' + error + '] ' + response.error_description;
  } else if (error) {
    message = error;
  } else {
    message = "детали ошибки не указаны.";
  }


  throw new URIError(message);
}
