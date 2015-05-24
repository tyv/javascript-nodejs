var Router = require('koa-router');

var action = require('./controllers/action');
var frontpage = require('./controllers/frontpage');
//var subscriptions = require('./controllers/subscriptions');
var subscribe = require('./controllers/subscribe');

var router = module.exports = new Router();

router.post("/subscribe", subscribe.post);
router.get("/", frontpage.get);
//router.post("/", frontpage.post);
router.get("/action/:accessKey", action.get);

router.get("/subscriptions/:accessKey", frontpage.get);

