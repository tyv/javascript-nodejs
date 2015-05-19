var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var upload = require('./controllers/upload');

var router = module.exports = new Router();

router.post('/upload', mustBeAuthenticated, upload.post);

