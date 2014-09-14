var Router = require('koa-router');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Article = require('tutorial').Article;

var router = module.exports = new Router();


router.get('/test', function*() {
  var tree = yield Article.findTree();
  debugger;
});

