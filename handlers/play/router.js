var Router = require('koa-router');

var play = require('./controllers/play');

var router = module.exports = new Router();

router.get('/:playId?', play.get);
