var Order = require('payments').Order;

// middleware
// create order from template,
// use the incoming data if needed
module.exports = function*(orderTemplate, user, requestBody) {

  var order = new Order({
    title:       orderTemplate.title,
    description: orderTemplate.description,
    amount:      requestBody.amount,
    module:      orderTemplate.module,
    data: {
      invoice: requestBody.invoiceNumber
    }
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
