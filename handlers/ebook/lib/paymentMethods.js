const payments = require('payments');

var paymentMethods = {};


/*
var methodsEnabled = ['webmoney', 'yandexmoney', 'payanyway', 'paypal'];

methodsEnabled.forEach(function(key) {
  paymentMethods[key] = payments.methods[key].info;
});
*/

for (var name in payments.methods) {
  paymentMethods[name] = payments.methods[name].info;
}

module.exports = paymentMethods;
