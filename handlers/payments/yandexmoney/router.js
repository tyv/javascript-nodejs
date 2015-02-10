var Router = require('koa-router');
var mustBeAdmin = require('auth').mustBeAdmin;
var router = module.exports = new Router();

var processPayments = require('./controller/processPayments');
var back = require('./controller/back');

router.get('/back', back.get);
router.get('/processPayments', mustBeAdmin, processPayments.get);

