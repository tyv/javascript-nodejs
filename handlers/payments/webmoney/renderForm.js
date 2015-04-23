const jade = require('lib/serverJade');
const config = require('config');
const path = require('path');

module.exports = function* (transaction) {

  return jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    webmoney:  config.payments.modules.webmoney
  });

};


