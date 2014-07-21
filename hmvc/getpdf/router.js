var payment = require('../payment');
var Router = require('koa-router');

var router = module.exports = new Router();

var main = require('./controller/main');
var pay = require('./controller/pay');
var success = require('./controller/success');

router.get('', main.get);
router.get('/order/:orderNumber', payment.loadOrderMiddleware('orderNumber'), main.get);

router.post('/pay', payment.loadOrderMiddleware('orderNumber'), pay.post);
router.get('/success/:orderNumber', payment.loadOrderMiddleware('orderNumber'), success.get);
