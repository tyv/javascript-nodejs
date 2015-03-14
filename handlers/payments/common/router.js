var Router = require('koa-router');

var router = module.exports = new Router();

var checkout = require('./controller/checkout');

router.post('/checkout', checkout.post);



