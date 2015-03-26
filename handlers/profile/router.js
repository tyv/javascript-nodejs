var Router = require('koa-router');

var partials = require('./controller/partials');
var index = require('./controller/index');

var router = module.exports = new Router();

router.get('/', index.get);

router.get('/:profileName/:tab?', index.get);

router.get('/templates/partials/:partial', partials.get);

