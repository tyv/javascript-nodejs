var Router = require('koa-router');

var router = module.exports = new Router();

var callback = require('./controller/callback');

var success = require('./controller/success');
var cancel = require('./controller/cancel');
var fail = require('./controller/fail');

router.post('/callback', callback.post);

router.all('/success', success.all);

router.get('/cancel', cancel.get);
router.get('/fail', fail.get);


