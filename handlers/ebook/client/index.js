var OrderForm = require('./orderForm');

function init() {


  var orderForm = document.querySelector('[data-order-form]');
  if (orderForm) {
    new OrderForm({
      elem: orderForm
    });
  }

}

init();
