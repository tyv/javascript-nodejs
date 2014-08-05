'use strict';

var mount = require('koa-mount');
var compose = require('koa-compose');
var mountHmvc = require('lib/mountHmvc');

module.exports = function(app) {


  app.use(mountHmvc('/', 'frontpage'));

  if (process.env.NODE_ENV == 'development') {
    app.use(mountHmvc('/markup', 'markup'));
  }

  app.use(mountHmvc('/auth', 'auth'));
  app.csrf.addIgnorePath('/auth/login/:any*');


  app.use(mountHmvc('/getpdf', 'getpdf'));

  app.use(mountHmvc('/payments', 'payments'));
  app.csrf.addIgnorePath('/payments/:any*');
  app.verboseLogger.addPath('/payments/:any*');

  /*
  app.use(mount('/webmoney', compose([payment.middleware, require('webmoney').middleware])));
  app.csrf.addIgnorePath('/webmoney/:any*');
  app.verboseLogger.addPath('/webmoney/:any*');

  app.use(mount('/yandexmoney', compose([payment.middleware, require('yandexmoney').middleware])));
  app.csrf.addIgnorePath('/yandexmoney/:any*');
  app.verboseLogger.addPath('/yandexmoney/:any*');

  app.use(mount('/payanyway', compose([payment.middleware, require('payanyway').middleware])));
  app.csrf.addIgnorePath('/payanyway/:any*');
  app.verboseLogger.addPath('/payanyway/:any*');

  app.use(mount('/paypal', compose([payment.middleware, require('paypal').middleware])));
  app.csrf.addIgnorePath('/paypal/:any*');
  app.verboseLogger.addPath('/paypal/:any*');
*/

  // stick to bottom to detect any not-yet-processed /:slug
  app.use(mountHmvc('/', 'tutorial'));

  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here manually
  app.use(function* (next) {
    yield* next;

    if (this.status == 404) {
      // still nothing found? let default errorHandler show 404
      this.throw(404);
    }
  });

};
