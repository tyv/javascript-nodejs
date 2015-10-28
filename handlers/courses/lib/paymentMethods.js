const payments = require('payments');

var paymentMethods = {};

var methodsEnabled = [ 'paypal', 'webmoney', 'yandexmoney', 'payanyway', 'interkassa', 'banksimple', 'banksimpleua', 'invoice'];

methodsEnabled.forEach(function(key) {
  paymentMethods[key] = payments.methods[key].info;
});

module.exports = paymentMethods;
