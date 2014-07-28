var Router = require('koa-router');
var form = require('./controller/form');
var local = require('./controller/login/local');
var logout = require('./controller/logout');

var router = module.exports = new Router();

router.get('/form', form.get);

router.post('/login/local', local.post);

router.post('/logout', logout.post);
