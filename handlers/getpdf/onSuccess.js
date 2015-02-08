const Order = require('payments').Order;

const ExpiringDownloadLink = require('download').ExpiringDownloadLink;

module.exports = function* (order) {

  var downloadLink = new ExpiringDownloadLink({
    relativePath: 'tutorial/book.zip'
  });

  yield downloadLink.persist();

  yield this.sendMail({
    template: 'success-email',
    to: order.email,
    subject: "Учебник для чтения оффлайн",
    link: downloadLink.getUrl()
  });

  order.data.downloadLink = downloadLink.getUrl();
  order.markModified('data');
  order.status = Order.STATUS_SUCCESS;

  yield order.persist();

  this.log.debug("Order success: " + order.number);
};
