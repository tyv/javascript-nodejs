var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;

var partials = require('./controller/partials');
var index = require('./controller/index');

var router = module.exports = new Router();

router.get('/:tab?', mustBeAuthenticated, index.get);

router.get('/templates/partials/:partial', partials.get);

