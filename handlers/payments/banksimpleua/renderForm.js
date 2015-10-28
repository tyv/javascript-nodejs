const jade = require('lib/serverJade');
const config = require('config');
const path = require('path');

module.exports = function* (transaction, order) {

  var form = jade.renderFile(path.join(__dirname, 'templates/form.jade'), {
    orderNumber: order.number
  });

  return form;

};


