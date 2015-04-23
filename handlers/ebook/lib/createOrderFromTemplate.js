var Order = require('payments').Order;

// middleware
// create order from template,
// use the incoming data if needed
module.exports = function* (orderTemplate, user, requestBody) {

  var order = new Order({
    title:       orderTemplate.title,
    description: orderTemplate.description,
    amount:      orderTemplate.amount,
    module:      orderTemplate.module,
    data:        orderTemplate.data
  });

  if (user) {
    order.user = user._id;
    order.email = user.email;
  } else {
    order.email = requestBody.email;
  }

  yield order.persist();

  return order;

};
