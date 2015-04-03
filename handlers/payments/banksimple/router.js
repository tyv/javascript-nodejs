var Router = require('koa-router');

var router = module.exports = new Router();

var invoice = require('./controller/invoice');

router.get('/:transactionNumber/invoice.docx', invoice.get);


