const config = require('config');
const mongoose = require('mongoose');
const log = require('js-log')();

exports.post = function* (next) {
  yield* this.loadTransaction('LMI_PAYMENT_NO');

  this.redirectToOrder();
};
