const jade = require('jade');
const config = require('config');
const path = require('path');

module.exports = function* (transaction) {

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    webmoney:  config.payments.modules.webmoney
  });

  return {form: form};

};


