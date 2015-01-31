// TODO


var oxr = require('open-exchange-rates');
var config = require('config');
var LRU = require("lru-cache");
var CurrencyRate = require('./models/currencyRate');
var list = require('./list');

/* jshint -W106 */
oxr.set({ app_id: config.openexchangerates.appId });

var cache = LRU({
  max: 100,
  maxAge: 12 * 3600 * 1000 // 12h
});

// all currencies
exports.list = list;

exports.convert = function(from, to, amount) {

  if (!list[from]) {
    throw new Error("Unknown currency: " + from);
  }

  if (!list[to]) {
    throw new Error("Unknown currency: " + to);
  }

  var rate = cache.get[from+":"+to];

  if (!rate) {
    var currencyRate = yield CurrencyRate.find({from: from, to: to}).sort({created: -1}).limit(1).exec();
  }



};


