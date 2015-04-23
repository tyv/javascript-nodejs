var Router = require('koa-router');

var router = module.exports = new Router();

var invoice = require('./controller/invoice');
var agreement = require('./controller/agreement');

router.get('/:transactionNumber/invoice.docx', invoice.get);
router.get('/:transactionNumber/agreement.docx', agreement.get);

