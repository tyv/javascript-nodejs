
// - Initialize money module for sync conversion
// - Load rates from DB on boot
// - provide /currency-rate/update url to update money rates

var config = require('config');
var CurrencyRate = require('./models/currencyRate');

var currencyRate;

var request = require('koa-request');
var fetchLatest = require('./lib/fetchLatest');

// all supported currencies
// http://openexchangerates.org/api/currencies.json?app_id=APP_ID
var currencies = require('./currencies');

var money = require('money');


exports.boot = function*() {
  // load from db into memory
  currencyRate = yield CurrencyRate.find().sort({timestamp: -1}).limit(1).exec();

  if (!currencyRate) {
    currencyRate = yield* fetchLatest();
  }

  if (!currencyRate) {
    throw new Error("Unable to get latest currency rate");
  }

  money.rates = currencyRate.rates;
  money.base = currencyRate.base;

  // updated asynchronously
};


var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/currency-rate', __dirname));
};

