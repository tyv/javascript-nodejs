const jade = require('jade');
const config = require('config');
const path = require('path');

module.exports = function* (transaction) {

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    currency: config.payments.currency,
    id:     config.payments.modules.payanyway.id,
    limitIds: process.env.NODE_ENV == 'development' ? '' : '843858,248362,822360,545234,1028,499669'
  });

  return {form: form};

};


