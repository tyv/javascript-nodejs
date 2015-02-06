const Order = require('payments').Order;
const expiringDownload = require('expiringDownload');

const ExpiringDownloadLink = expiringDownload.ExpiringDownloadLink;
const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');

module.exports = function* (order) {


  // CREATE DOWNLOAD LINK

  // EMAIL IT TO USER (move nodemailer to a separate site-wide "mail" module)
  /*
  var transporter = nodemailer.createTransport(ses({
    accessKeyId: 'AWSACCESSKEY',
    secretAccessKey: 'AWS/Secret/key'
  }));
  transporter.sendMail({
    from: 'sender@address',
    to: 'receiver@address',
    subject: 'hello',
    text: 'hello world!'
  });
*/

  // ...

  order.data.bookInfo = "Скачивать книгу тут";

  order.markModified('data');
  order.status = Order.STATUS_SUCCESS;


  yield order.persist();


  console.log("Order success: " + order.number);
};
