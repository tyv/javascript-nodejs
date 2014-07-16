var Router = require('koa-router');

var task = require('./controllers/task');
var article = require('./controllers/article');

var router = module.exports = new Router();

router.get(/^\/^task\/(.*)$/, task.get);
router.get(/^\/(.*)$/, article.get);
