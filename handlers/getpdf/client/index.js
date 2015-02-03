var OrderForm = require('./orderForm');

exports.init = function() {

  new OrderForm({
    elem: document.querySelector('[data-order-form]')
  });

};