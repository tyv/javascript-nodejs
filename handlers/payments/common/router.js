var Router = require('router');

var router = module.exports = new Router();

var checkout = require('./controller/checkout');
var ordersByUser = require('./controller/ordersByUser');

router.post('/checkout', checkout.post);

router.get('/orders/user/:userById', ordersByUser.get);


// form for invoices (after generating the transaction) submits here to go back to order,
// without any external service
router.post('/redirect/order/:orderNumber', function*() {
  yield this.loadOrder();
  this.redirectToOrder();
});



