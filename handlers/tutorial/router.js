var Router = require('koa-router');

var task = require('./controller/task');
var article = require('./controller/article');
var ebook = require('./controller/ebook');
var tutorial = require('./controller/tutorial');
var node = require('./controller/node');
var zipview = require('./controller/zipview');
var map = require('./controller/map');

var router = module.exports = new Router();

router.get('/task/:slug/:view/:serverPath*', node.all);
router.get('/article/:slug/:view/:serverPath*', node.all);

router.get('/task/:slug', task.get);
router.get('/tutorial/map', map.get);
router.get('/tutorial/zipview/:name', zipview.get);
router.get('/tutorial', tutorial.get);
router.get('/:slug', article.get);
router.get('/pdf/:slug', ebook.get);
router.get('/epub/:slug', ebook.get);

