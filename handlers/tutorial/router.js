var Router = require('koa-router');

var task = require('./controller/task');
var article = require('./controller/article');
var ebook = require('./controller/ebook');
var tutorial = require('./controller/tutorial');
var map = require('./controller/map');

var router = module.exports = new Router();

router.get('/task/:slug', task.get);
router.get('/tutorial/map', map.get);
router.get('/tutorial', tutorial.get);
router.get('/:slug', article.get);
router.get('/ebook/:slug', ebook.get);

