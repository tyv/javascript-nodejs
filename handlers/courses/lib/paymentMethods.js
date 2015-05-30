const payments = require('payments');

var paymentMethods = {};

var methodsEnabled = [ 'paypal', 'webmoney', 'yandexmoney', 'payanyway', 'interkassa', 'banksimple', 'invoice'];

methodsEnabled.forEach(function(key) {
  paymentMethods[key] = payments.methods[key].info;
});

module.exports = paymentMethods;
