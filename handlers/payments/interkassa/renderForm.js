const jade = require('lib/serverJade');
const config = require('config');
const path = require('path');

module.exports = function* (transaction) {

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount:   transaction.amount,
    number:   transaction.number,
    currency: transaction.currency,
    id:       config.payments.modules.interkassa.id
  });

  return form;

};


