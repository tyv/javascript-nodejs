var config = require('config');
var assert = require('assert');

/**
 * Configured (only) payment methods
 */
var paymentMethods = {};
for(var key in config.payments.modules) {
  paymentMethods[key] = require('../' + key);
  assert(paymentMethods[key].renderForm, key + ": no renderForm");
}

module.exports = paymentMethods;