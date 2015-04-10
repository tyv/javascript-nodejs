var Router = require('koa-router');

var router = module.exports = new Router();

var newOrder = require('./controller/newOrder');
var orders = require('./controller/orders');

router.get('/', newOrder.get);
router.get('/orders/:orderNumber(\\d+)', orders.get);

