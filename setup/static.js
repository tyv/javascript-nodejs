'use strict';

const serve = require('koa-static');
const favicon = require('koa-favicon');

module.exports = function(app) {
  app.use(serve(process.cwd() + '/app'));
  app.use(favicon());
};