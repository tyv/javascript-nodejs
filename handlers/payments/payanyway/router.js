var Router = require('koa-router');

var router = module.exports = new Router();

var callback = require('./controller/callback');

var success = require('./controller/success');
var inprogress = require('./controller/inprogress');
var cancel = require('./controller/cancel');

router.post('/callback', callback.post);

router.get('/success', success.get);
router.get('/inprogress', inprogress.get);

router.get('/cancel', cancel.get);


