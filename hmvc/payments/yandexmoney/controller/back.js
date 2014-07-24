const config = require('config');
const Order = require('../../models/order');
const Transaction = require('../../models/transaction');
const log = require('js-log')();
const request = require('koa-request');

log.debugOn();

/* jshint -W106 */
exports.get = function* (next) {

  var self = this;

  yield* this.loadTransaction();

  yield this.transaction.log({
    event: 'back',
    data:  {url: this.request.originalUrl, body: this.request.body}
  });


  if (!this.query.code) {
    yield* fail(this.query.error_description || this.query.error);
    return;
  }


  try {
    var oauthTokenResponse = yield* requestOauthToken(this.query.code);

    var oauthToken = oauthTokenResponse.access_token;
    if (!oauthToken) {
      throwResponseError(oauthTokenResponse);
    }

    var requestPaymentResponse = yield* requestPayment(oauthToken);

    if (requestPaymentResponse.status != "success") {

      if (requestPaymentResponse.error == 'ext_action_required') {
        self.redirect(requestPaymentResponse.ext_action_uri);
        return;
      }

      throwResponseError(requestPaymentResponse);
    }

    var requestId = requestPaymentResponse.request_id;

    var startTime = new Date();

    while_in_progress:
      while (true) {
        if (new Date() - startTime > 5 * 60 * 1e3) { // 5 minutes wait max
          yield* fail("timeout");
          return;
        }
        var processPaymentResponse = yield* processPayment(oauthToken, requestId);

        switch (processPaymentResponse.status) {
        case 'success':
          break while_in_progress;
        case 'refused':
          yield* fail(processPaymentResponse.error);
          return;
        case 'ext_auth_required':
          yield* fail("необходимо подтвердить авторизацию по технологии 3D-Secure");
          return;
        case 'in_progress':
          yield delay(processPaymentResponse.next_retry);
          break;
        default:
          yield delay(1000);
        }

      }


    // success!
    var orderModule = require(this.order.module);
    yield* orderModule.onSuccess(this.order);


    self.redirect(self.getOrderSuccessUrl());

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

    yield self.transaction.persist();

    self.redirectToOrder();
  }


  function* requestOauthToken(code) {

    // request oauth token
    var options = {
      method: 'POST',
      form:   {
        code:          code,
        client_id:     config.payments.modules.yandexmoney.clientId,
        grant_type:    'authorization_code',
        redirect_uri:  config.payments.modules.yandexmoney.redirectUri + '?transactionNumber=' + self.transaction.number,
        client_secret: config.payments.modules.yandexmoney.clientSecret
      },
      url:    'https://sp-money.yandex.ru/oauth/token'
    };


    yield self.transaction.log({ event: 'request oauth/token', data: options });

    var response = yield request(options);

    yield self.transaction.log({ event: 'response oauth/token', data: response.body });

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
        amount:          self.transaction.amount,
        comment:         'оплата по счету ' + self.transaction.number,
        message:         'оплата по счету ' + self.transaction.number,
        identifier_type: 'account'
      },
      headers: {
        'Authorization': 'Bearer ' + oauthToken
      },
      url:     'https://money.yandex.ru/api/request-payment'
    };

    yield self.transaction.log({ event: 'request api/request-payment', data: options });

    var response = yield request(options);
    yield self.transaction.log({ event: 'response api/request-payment', data: response.body });

    return JSON.parse(response.body);
  }

  function* processPayment(oauthToken, requestId) {
    var options = {
      method:  'POST',
      form:    {
        request_id: requestId
      },
      headers: {
        'Authorization': 'Bearer ' + oauthToken
      },
      url:     'https://money.yandex.ru/api/process-payment'
    };

    yield self.transaction.log({ event: 'request api/process-payment', data: options });

    var response = yield request(options);
    yield self.transaction.log({ event: 'response api/process-payment', data: response.body });

    return JSON.parse(response.body);
  }


};

function throwResponseError(response) {
  var message;

  if (response.error && response.error_description) {
    message = '[' + response.error + '] ' + response.error_description;
  } else if (response.error) {
    message = response.error;
  } else {
    message = "детали ошибки не указаны";
  }

  throw new URIError(message);
}

function delay(ms) {
  return function(callback) {
    setTimeout(callback, ms);
  };
}
