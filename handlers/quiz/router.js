var Router = require('koa-router');

var index = require('./controllers/index');
var start = require('./controllers/start');
var question = require('./controllers/question');

var router = module.exports = new Router();

router.get("/", index.get);
router.post("/start/:slug", start.post);
router.get("/:slug", question.get);

