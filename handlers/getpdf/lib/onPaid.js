const Order = require('payments').Order;
const sendMail = require('sendMail');
const ExpiringDownloadLink = require('download').ExpiringDownloadLink;
const path = require('path');
const log = require('log')();

// not a middleware
// can be called from CRON
module.exports = function* (order) {

  var downloadLink = new ExpiringDownloadLink({
    relativePath: order.data.file
  });

  downloadLink.linkId += "/" + path.basename(order.data.file);

  yield downloadLink.persist();

  yield sendMail({
    templatePath: path.join(__dirname, '..', 'templates', 'success-email'),
    to: order.email,
    subject: "Учебник для чтения оффлайн",
    link: downloadLink.getUrl()
  });

  order.data.downloadLink = downloadLink.getUrl();
  order.markModified('data');
  order.status = Order.STATUS_SUCCESS;

  yield order.persist();

  log.debug("Order success: " + order.number);
};
