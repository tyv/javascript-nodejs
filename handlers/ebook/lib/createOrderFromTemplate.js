var Order = require('payments').Order;

// middleware
// create order from template,
// use the incoming data if needed
module.exports = function(orderTemplate) {

  var order = new Order({
    title:       orderTemplate.title,
    description: orderTemplate.description,
    amount:      orderTemplate.amount,
    module:      orderTemplate.module,
    data:        orderTemplate.data
  });

  if (this.req.user) {
    order.user = this.req.user._id;
    order.email = this.req.user.email;
  } else {
    order.email = this.request.body.email;
  }

  return order;

};