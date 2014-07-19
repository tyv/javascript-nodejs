'use strict';

var mount = require('koa-mount');

module.exports = function(app) {

  app.use(mount('/', app.hmvc.frontpage.middleware));

  if (process.env.NODE_ENV == 'development') {
    app.use(mount('/markup', app.hmvc.markup.middleware));
  }

  app.use(mount('/getpdf', app.hmvc.getpdf.middleware));

  // stick to bottom
  app.use(mount('/', app.hmvc.tutorial.middleware));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here
  app.use(function* (next) {
    this.throw(404);
  });

};
