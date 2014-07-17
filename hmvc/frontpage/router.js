var Router = require('koa-router');

var frontpage = require('./controller/frontpage');

var router = module.exports = new Router();

router.get('/', frontpage.get);

