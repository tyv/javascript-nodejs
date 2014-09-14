var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;

var account = require('./controller/account');

var router = module.exports = new Router();

router.get('/account', mustBeAuthenticated, account.get);

