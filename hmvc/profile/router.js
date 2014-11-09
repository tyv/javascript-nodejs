var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;

var account = require('./controller/account');
var profile = require('./controller/profile');

var router = module.exports = new Router();

router.get('/', mustBeAuthenticated, profile.get);
router.get('/account', mustBeAuthenticated, account.get);

