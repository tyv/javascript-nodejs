const config = require('config');
const mongoose = require('mongoose');

exports.post = function* (next) {
  yield* this.loadTransaction('LMI_PAYMENT_NO');

  this.redirectToOrder();
};
