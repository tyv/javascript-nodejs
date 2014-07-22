'use strict';

var mount = require('koa-mount');

module.exports = function(app) {


  app.use(mount('/', require('frontpage').middleware));

  if (process.env.NODE_ENV == 'development') {
    app.use(mount('/markup', require('markup').middleware));
  }

  app.use(mount('/getpdf', require('getpdf').middleware));

  app.use(mount('/webmoney', require('webmoney').middleware));
  app.csrf.addIgnorePath('/webmoney/:any*');
  app.verboseLogger.addPath('/webmoney/:any*');

  /*
  app.use(mount('/yandexmoney', app.hmvc.yandexmoney.middleware));
  app.noCsrf.push(/^\/yandexmoney\//);
*/

  // stick to bottom
  app.use(mount('/', require('tutorial').middleware));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here manually
  app.use(function* (next) {
    this.throw(404);
  });

};
