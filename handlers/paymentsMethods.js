const mongoose = require('mongoose');
const payments = require('payments');
const config = require('config');

exports.init = function(app) {
  app.use(payments.populateContextMiddleware);
};

