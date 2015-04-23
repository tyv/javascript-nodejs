var Router = require('koa-router');

var router = module.exports = new Router();

var checkout = require('./controller/checkout');

router.post('/checkout', checkout.post);


// form for invoices (after generating the transaction) submits here to go back to order,
// without any external service
router.post('/redirect/order/:orderNumber', function*() {
  yield this.loadOrder();
  this.redirectToOrder();
});



