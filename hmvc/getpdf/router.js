var Router = require('koa-router');


var router = module.exports = new Router();

var root = require('./controller/root');
var order = require('./controller/order');

router.get('', root.get);
router.post('/order', order.post);
