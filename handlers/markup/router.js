var Router = require('koa-router');

var markup = require('./controller/markup');

var router = module.exports = new Router();

router.get("/:path*", markup.get);

