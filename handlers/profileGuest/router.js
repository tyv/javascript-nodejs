var Router = require('koa-router');

var index = require('./controller/index');

var router = module.exports = new Router();

router.get('/:profileName/:tab?', index.get);


