const jade = require('jade');
const config = require('config');
const path = require('path');
const assert = require('assert');

module.exports = function* (transaction) {

  assert(config.payments.modules.yandexmoney.redirectUri.startsWith('http'));

  return jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    clientId:          config.payments.modules.yandexmoney.clientId,
    redirectUri:       config.payments.modules.yandexmoney.redirectUri,
    purse:             config.payments.modules.yandexmoney.purse,
    transactionNumber: transaction.number,
    amount:            transaction.amount
  });

};



