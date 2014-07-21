var Router = require('koa-router');
var payment = require('../payment');

var router = module.exports = new Router();

var result = require('./controller/result');
var success = require('./controller/success');
var fail = require('./controller/fail');
var wait = require('./controller/wait');

// webmoney server posts here (in background)
router.post('/result', result.post);

// webmoney server redirects here if payment successful
router.get('/success', payment.loadTransactionMiddleware('LMI_PAYMENT_NO'), success.get);
// but if transaction status is not yet received, we wait...
router.post('/wait', payment.loadTransactionMiddleware(), wait.post);

// webmoney server redirects here if payment failed
router.get('/fail', payment.loadTransactionMiddleware('LMI_PAYMENT_NO'), fail.get);


