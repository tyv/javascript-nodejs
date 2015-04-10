const payments = require('payments');

var paymentMethods = {};

var methodsEnabled = ['webmoney', 'yandexmoney', 'payanyway', 'paypal', 'interkassa'];

methodsEnabled.forEach(function(key) {
  paymentMethods[key] = {name: key, title: payments.methods[key].title};
});

module.exports = paymentMethods;
