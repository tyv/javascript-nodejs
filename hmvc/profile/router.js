var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;

var account = require('./controller/account');
var partials = require('./controller/partials');
var index = require('./controller/index');

var router = module.exports = new Router();

router.get('/', mustBeAuthenticated, index.get);
router.get('/account', mustBeAuthenticated, account.get);

router.get('/templates/partials/:partial', partials.get);

