var Router = require('koa-router');

var router = module.exports = new Router();

var order = require('./controller/order');
var pay = require('./controller/pay');
var success = require('./controller/success');

router.get('', order.get);
router.get('/order/:orderNumber', order.get);

router.post('/pay', pay.post);
router.get('/success/:orderNumber', success.get);
