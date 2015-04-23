var Router = require('koa-router');

var router = module.exports = new Router();

var ipn = require('./controller/ipn');
var success = require('./controller/success');
var cancel = require('./controller/cancel');

// webmoney server posts here (in background)
router.post('/ipn', ipn.post);

// webmoney server redirects here if payment successful
router.get('/success', success.get);

router.get('/cancel', cancel.get);


