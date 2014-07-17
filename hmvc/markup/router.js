var Router = require('koa-router');

var task = require('./controller/task');
var article = require('./controller/article');

var router = module.exports = new Router();

router.get(/^\/task\/(.*)$/, task.get);
router.get(/^\/(.*)$/, article.get);

