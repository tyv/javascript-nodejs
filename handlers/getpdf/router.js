var Router = require('koa-router');

var router = module.exports = new Router();

var order = require('./controller/order');
var orders = require('./controller/orders');
var checkout = require('./controller/checkout');

router.get('/:orderTemplate', order.get);
router.get('/orders/:orderNumber(\\d+)', orders.get);

//router.get('/pay-result/:orderNumber(\\d+)', payResult.get);

router.post('/checkout', checkout.post);
