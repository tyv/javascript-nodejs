var Router = require('koa-router');
var payment = require('../payment');

var router = module.exports = new Router();

var back = require('./controller/back');

router.get('/back', payment.loadTransactionMiddleware(), back.get);


