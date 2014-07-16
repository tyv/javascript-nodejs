'use strict';

var mount = require('koa-mount');
var Router = require('koa-router');

module.exports = function(app) {

  //app.use(router(app));

  app.use(mount('/', require('hmvc/tutorial').router.middleware()));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here
  app.use(function* (next) {
    console.log("NO RESULT");
    this.throw(404);
  });

};
