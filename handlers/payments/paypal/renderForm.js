const jade = require('lib/serverJade');
const config = require('config');
const paypalConfig = config.payments.modules.paypal;
const path = require('path');

module.exports = function* (transaction) {

  /* jshint -W106 */
  var fields = {
    business: paypalConfig.email,
    invoice: transaction.number,
    amount: transaction.amount,
    item_name: "Оплата по счёту " + transaction.number,
    charset: "utf-8",
    cmd: "_xclick",
    no_note: 1,
    no_shipping: 1,
    rm: 2, // the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
    currency_code: transaction.currency,
    lc: "RU",
    notify_url: process.env.SITE_HOST + '/payments/paypal/ipn?transactionNumber=' + transaction.number,
    cancel_url: process.env.SITE_HOST + '/payments/paypal/cancel?transactionNumber=' + transaction.number,
    return: process.env.SITE_HOST + '/payments/paypal/success?transactionNumber=' + transaction.number
  };


  yield transaction.log("form fields", fields);

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    fields: fields
  });

  return form;

};


