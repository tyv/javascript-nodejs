const Order = require('payments').Order;
const sendMail = require('mailer').send;
const ExpiringDownloadLink = require('download').ExpiringDownloadLink;
const path = require('path');
const log = require('log')();

// not a middleware
// can be called from CRON
module.exports = function* (order) {

  order.status = Order.STATUS_SUCCESS;

  yield order.persist();

  log.debug("Order success: " + order.number);
};
