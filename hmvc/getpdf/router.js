var Router = require('koa-router');

var router = module.exports = new Router();

var orders = require('./controller/orders');
var payResult = require('./controller/payResult');
var checkout = require('./controller/checkout');

router.get('/:orderTemplate', orders.get);
router.get('/orders/:orderNumber(\\d+)', orders.get);

router.get('/pay-result/:orderNumber(\\d+)', payResult.get);

router.post('/checkout', checkout.post);
