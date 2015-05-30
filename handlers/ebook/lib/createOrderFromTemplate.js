var Order = require('payments').Order;
var Discount = require('payments').Discount;

// middleware
// create order from template,
// use the incoming data if needed
module.exports = function* (orderTemplate, user, requestBody) {

  var amount = orderTemplate.amount;
  if (requestBody.discountCode) {
    var discount = yield* Discount.findByCodeAndModule(requestBody.discountCode, 'ebook');
    if (discount) amount = discount.adjustAmount(amount);
  }

  var order = new Order({
    title:       orderTemplate.title,
    description: orderTemplate.description,
    amount:      amount,
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
