'use strict';

const router = require('koa-router');
module.exports = function(app) {

  app.use(router(app));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here
  app.use(function* (next) {
    this.throw(404);
  });

};