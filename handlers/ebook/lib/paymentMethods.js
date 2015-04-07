const payments = require('payments');

var paymentMethods = {};

['webmoney', 'yandexmoney', 'payanyway', 'paypal'].forEach(function(key) {
  paymentMethods[key] = {name: key, title: payments.methods[key].title};
});

module.exports = paymentMethods;
