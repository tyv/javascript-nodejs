var Router = require('koa-router');

var router = module.exports = new Router();

var back = require('./controller/back');

router.get('/back', back.get);


