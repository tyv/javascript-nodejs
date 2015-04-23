var Router = require('koa-router');

var index = require('./controllers/index');
var start = require('./controllers/start');
var save = require('./controllers/save');
var answer = require('./controllers/answer');
var quiz = require('./controllers/quiz');
var resultsUser = require('./controllers/resultsUser');

var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var router = module.exports = new Router();

router.get("/", index.get);
router.get("/results/user/:id", mustBeAuthenticated, resultsUser.get);
router.post("/start/:slug", start.post);
router.post("/save/:slug", mustBeAuthenticated, save.post);
router.post("/answer/:slug", answer.post);
router.get("/:slug", quiz.get);

