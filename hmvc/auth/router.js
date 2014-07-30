var Router = require('koa-router');
var form = require('./controller/form');
var user = require('./controller/user');
var local = require('./controller/login/local');
var logout = require('./controller/logout');

var router = module.exports = new Router();

router.get('/form', form.get);
router.get('/user', user.get);

router.post('/login/local', local.post);

router.post('/logout', logout.post);
