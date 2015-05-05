var Router = require('koa-router');

var task = require('./controller/task');
var article = require('./controller/article');
var frontpage = require('./controller/frontpage');
var node = require('./controller/node');
var zipview = require('./controller/zipview');
var map = require('./controller/map');

var router = module.exports = new Router();

router.all('/task/:slug/:view/:serverPath*', node.all);
router.all('/article/:slug/:view/:serverPath*', node.all);

router.get('/task/:slug', task.get);
router.get('/tutorial/map', map.get);
router.get('/tutorial/zipview/:name', zipview.get);
router.get('/', frontpage.get);
router.get('/tutorial', function*() {
  this.status = 301;
  this.redirect('/');
});

router.get('/:slug', article.get);
