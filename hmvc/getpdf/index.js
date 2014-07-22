
var router = require('./router');

exports.middleware = router.middleware();

exports.onSuccess = function(order) {
  console.log("Order success: " + order.number);
};
