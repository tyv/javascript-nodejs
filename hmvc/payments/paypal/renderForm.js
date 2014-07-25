const jade = require('jade');
const config = require('config');
const paypalConfig = config.payments.modules.paypal;
const path = require('path');
const signCart = require('./signCart')(paypalConfig.myCertPath, paypalConfig.myKeyPath, paypalConfig.paypalCertPath);

module.exports = function* (transaction) {

  /* jshint -W106 */
  var cart = {
    cert_id: paypalConfig.certId,
    business: paypalConfig.email,
    invoice: transaction.number,
    amount: transaction.amount,
    item_name: "Оплата по счёту " + transaction.number,
    cmd: "_xclick", // Buy now button (buying a single item, works with Encrypted Website Payments, not sure if _cart works too)
    charset: "utf-8",
    no_note: 1,
    no_shipping: 1,
    rm: 2,
    currency_code: config.payments.currency,
    lc: "RU"
  };

  var cartFormatted = [];
  for(var key in cart) {
    cartFormatted.push(key + '=' + cart[key]);
  }
  cartFormatted = cartFormatted.join("\n");

  yield transaction.log("cartFormatted", cartFormatted);

  var cartEncrypted = yield signCart(cartFormatted);

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    encrypted: cartEncrypted,
    notifyUrl: paypalConfig.callbackUrl + '?transactionNumber=' + transaction.number,
    cancelUrl: paypalConfig.cancelUrl + '?transactionNumber=' + transaction.number,
    returnUrl: paypalConfig.successUrl + '?transactionNumber=' + transaction.number
  });

  return form;

};


