'use strict';

var mount = require('koa-mount');
var Router = require('koa-router');

module.exports = function(app) {

  //app.use(router(app));

  app.use(mount('/', app.hmvc.frontpage.middleware));

  if (process.env.NODE_ENV == 'development') {
    app.use(mount('/markup', app.hmvc.markup.middleware));
  }

  app.use(mount('/', app.hmvc.tutorial.middleware));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here
  app.use(function* (next) {
    this.throw(404);
  });

};
