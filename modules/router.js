var KoaRouter = require('koa-router');
var inherits = require('inherits');
var mongoose = require('mongoose');
var User = require('users').User;

function Router() {
  KoaRouter.apply(this, arguments);
}

inherits(Router, KoaRouter);

module.exports = Router;
