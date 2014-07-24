const mongoose = require('mongoose');
const payments = require('payments');
const config = require('config');

module.exports = function(app) {
  app.use(payments.populateContextMiddleware);
};
