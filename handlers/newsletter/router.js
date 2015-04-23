var Router = require('koa-router');

var confirm = require('./controllers/confirm');
var subscriptions = require('./controllers/subscriptions');
var subscribe = require('./controllers/subscribe');

var router = module.exports = new Router();

router.post("/subscribe", subscribe.post);
router.get("/confirm/:accessKey", confirm.get);

router.get("/subscriptions/:accessKey", subscriptions.get);
router.post("/subscriptions/:accessKey", subscriptions.post);

