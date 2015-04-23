var Router = require('koa-router');
var mongoose = require('mongoose');
var CacheEntry = require('./models/cacheEntry');
var mustBeAdmin = require('auth').mustBeAdmin;
var _ = require('lodash');

var router = module.exports = new Router();

router.get('/destroy', mustBeAdmin, function*() {
  yield CacheEntry.destroy();

  this.body = 'done ' + new Date();
});

