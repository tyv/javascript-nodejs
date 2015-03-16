var Router = require('koa-router');

var confirm = require('./controllers/confirm');
var subscriptions = require('./controllers/subscriptions');
var remove = require('./controllers/remove');

var router = module.exports = new Router();

router.post("/subscriptions", subscriptions.post);
router.get("/confirm/:accessKey", confirm.get);
router.get("/remove/:accessKey", remove.get);

