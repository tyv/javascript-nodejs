var Router = require('koa-router');
var payment = require('payment');

var router = module.exports = new Router();

var result = require('./controller/result');
var success = require('./controller/success');
var fail = require('./controller/fail');
var wait = require('./controller/wait');

// webmoney server posts here (in background)
router.post('/result',
  payment.middleware.loadTransaction('LMI_PAYMENT_NO', {skipOwnerCheck : true}),
  result.post
);

// webmoney server redirects here if payment successful
router.get('/success', payment.middleware.loadTransaction('LMI_PAYMENT_NO'), success.get);
// but if transaction status is not yet received, we wait...
router.post('/wait', payment.middleware.loadTransaction(), wait.post);

// webmoney server redirects here if payment failed
router.get('/fail', payment.middleware.loadTransaction('LMI_PAYMENT_NO'), fail.get);


