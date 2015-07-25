
var request = require('koa-request');
var CurrencyRate = require('../models/currencyRate');

var config = require('config');
var log = require('log')();


module.exports = function*() {

  var result;

  try {
    result = yield request({
      url:  'http://openexchangerates.org/api/latest.json?app_id=' + config.openexchangerates.appId,
      json: true
    });
  } catch(e) {
    // failed to request (remote server unavailable?)
    log.error(e);
    return;
  }

  if (!result.body) {
    log.error(result);
    return;
  }

  if (!result.body.rates.RUB) {
    // something's wrong
    log.error(result);
    return;
  }

  var currencyRate = yield CurrencyRate.findOneAndUpdate(
    { timestamp: result.body.timestamp },
    result.body,
    {upsert: true}
  ).exec();

  return currencyRate;

};
