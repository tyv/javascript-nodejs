var Router = require('koa-router');
var payment = require('payment');

var router = module.exports = new Router();

var callback = require('./controller/callback');

var success = require('./controller/success');
var inprogress = require('./controller/inprogress');
var cancel = require('./controller/cancel');

// webmoney server posts here (in background)
router.post('/callback', callback.post);

// webmoney server redirects here if payment successful
router.get('/success', success.get);

router.get('/cancel', cancel.get);


