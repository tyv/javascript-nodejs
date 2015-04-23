var Router = require('koa-router');

var webhook = require('./controllers/webhook');

var router = module.exports = new Router();

router.post('/webhook', webhook.post);
