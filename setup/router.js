'use strict';

var mount = require('koa-mount');

module.exports = function(app) {


  app.use(mount('/', app.hmvc.frontpage.middleware));

  if (process.env.NODE_ENV == 'development') {
    app.use(mount('/markup', app.hmvc.markup.middleware));
  }

  app.use(mount('/getpdf', app.hmvc.getpdf.middleware));

  app.use(mount('/webmoney', app.hmvc.webmoney.middleware));
  app.noCsrf.push(/^\/webmoney\//);

  app.use(mount('/yandexmoney', app.hmvc.yandexmoney.middleware));
  app.noCsrf.push(/^\/yandexmoney\//);

  // stick to bottom
  app.use(mount('/', app.hmvc.tutorial.middleware));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here
  app.use(function* (next) {
    this.throw(404);
  });

};
