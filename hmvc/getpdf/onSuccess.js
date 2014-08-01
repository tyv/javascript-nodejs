const Transaction = require('payments').Transaction;
const expiringDownload = require('expiringDownload');

const ExpiringDownloadLink = expiringDownload.ExpiringDownloadLink;
const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');

module.exports = function* (order) {

  yield order.persist({
    status: Transaction.STATUS_SUCCESS
  });

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

  console.log("Order success: " + order.number);
};
