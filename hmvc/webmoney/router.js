var Router = require('koa-router');


var router = module.exports = new Router();

var result = require('./controller/result');
var back = require('./controller/back');
var wait = require('./controller/wait');

router.post('/result', result.post);
router.get('/back', back.get);
router.post('/wait', wait.post);


