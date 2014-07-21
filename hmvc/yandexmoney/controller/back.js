const config = require('config');
const mongoose = require('mongoose');
const Order = mongoose.models.Order;
const Transaction = mongoose.models.Transaction;
const TransactionLog = mongoose.models.TransactionLog;
const log = require('js-log')();
const md5 = require('MD5');
const request = require('koa-request');
log.debugOn();

/* jshint -W106 */
function* fail(ctx) {
  ctx.transaction.status = Transaction.STATUS_FAIL;
  yield ctx.transaction.persist();

  yield ctx.transaction.log({ event: 'fail' });

  var order = ctx.transaction.order;
  ctx.redirect('/' + order.module + '/order/' + order.number);
}

exports.get = function* (next) {

  yield this.transaction.log({
    event:       'back',
    data:        {url: this.request.originalUrl, body: this.request.body}
  });

  if (this.query.error) {
    fail(this);
    return;
  }

  if (this.query.code) {

    // request oauth token
    var options = {
      method: 'POST',
      form:   {
        code:          this.query.code,
        client_id:     config.yandexmoney.clientId,
        grant_type:    'authorization_code',
        redirect_uri:  config.yandexmoney.redirectUri + '?transactionNumber=' + this.transaction.number,
        client_secret: config.yandexmoney.clientSecret
      },
      url:    'https://sp-money.yandex.ru/oauth/token'
    };

    yield this.transaction.log({ event: 'request oauth/token', data: options });

    var response;
    try {
      var response = request(options);
      yield this.transaction.log({ event: 'response oauth/token', data: response });

      response = JSON.parse(response);
      if (!response.access_token) {
        throw new Error(response.error);
      }
    } catch(e) {
      fail(this);
      return;
    }

    var accessToken = response.access_token;

    // request payment
    var options = {
      method: 'POST',
      form:   {
        pattern_id:          'p2p',
        to:     config.yandexmoney.purse,
        amount: this.transaction.amount,
        comment: 'оплата по счету ' + this.transaction.number,
        message: 'оплата по счету ' + this.transaction.number,
        identifier_type:    'account'
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      url:    'https://money.yandex.ru/api/request-payment'
    };

    // TODO!

    yield this.transaction.log({ event: 'request api/request-payment', data: options });

    var response;
    try {
      var response = request(options);
      yield this.transaction.log({ event: 'response api/request-payment', data: response });

      response = JSON.parse(response);
      if (!response.access_token) {
        throw new Error(response.error);
      }
    } catch(e) {
      fail(this);
      return;
    }




    this.body = 'OK';
  }

  /*
  this.transaction.status = Transaction.STATUS_FAIL;
  yield this.transaction.persist();
  var order = this.transaction.order;
  this.redirect('/' + order.module + '/order/' + order.number);
*/
};
