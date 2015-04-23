// CRONTAB: run me daily
var Router = require('koa-router');
var mongoose = require('mongoose');
var CurrencyRate = require('./models/currencyRate');
var fetchLatest = require('./lib/fetchLatest');
var mustBeAdmin = require('auth').mustBeAdmin;

var router = module.exports = new Router();

var money = require('money');

router.get('/update', mustBeAdmin, function*() {
  var currencyRate = yield* fetchLatest();

  if (!currencyRate) {
    return;
  }

  money.rates = currencyRate.rates;
  money.base = currencyRate.base;

  this.body = {
    status: "ok",
    time: new Date()
  };
});

