var Router = require('koa-router');

var index = require('./controllers/index');

var router = module.exports = new Router();

router.get('/', index.get);
router.post('/', index.post);
