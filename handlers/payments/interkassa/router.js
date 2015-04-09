var Router = require('koa-router');

var router = module.exports = new Router();

var callback = require('./controller/callback');

var success = require('./controller/success');
var fail = require('./controller/fail');

router.post('/callback', callback.post);

router.post('/success', success.post);

router.post('/fail', fail.post);


