var Router = require('koa-router');

var router = module.exports = new Router();

var callback = require('./controller/callback');
var success = require('./controller/success');
var cancel = require('./controller/cancel');

// webmoney server posts here (in background)
router.post('/callback', callback.post);

// webmoney server redirects here if payment successful
router.post('/success', success.post);

router.get('/cancel', cancel.get);


