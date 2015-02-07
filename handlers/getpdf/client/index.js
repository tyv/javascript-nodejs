var OrderForm = require('./orderForm');

exports.init = function() {


  var orderForm = document.querySelector('[data-order-form]');
  if (orderForm) {
    new OrderForm({
      elem: orderForm
    });
  }

};