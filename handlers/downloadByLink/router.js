var Router = require('koa-router');

var download = require('./controllers/download');

var router = module.exports = new Router();

router.get('/:linkId*', download.get);
