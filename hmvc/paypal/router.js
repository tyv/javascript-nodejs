var Router = require('koa-router');
var payment = require('payment');

var router = module.exports = new Router();

var result = require('./controller/result');
var success = require('./controller/success');
var cancel = require('./controller/cancel');
var wait = require('./controller/wait');

// webmoney server posts here (in background)
router.post('/result', result.post);

// webmoney server redirects here if payment successful
router.get('/success', success.get);
// but if transaction status is not yet received, we wait...
router.post('/wait', wait.post);

router.get('/cancel', cancel.get);


