var mount = require('koa-mount');

// same as require(path).middleware, with additional pre/post-processing
var wrapHmvcMiddleware = require('lib/wrapHmvcMiddleware');

module.exports = function(app) {

  app.hmvc = {};

  app.mountHmvc = function(prefix, hmvcModulePath) {
    var hmvcModule = require(hmvcModulePath);
    hmvcModulePath = require.resolve(hmvcModulePath);
    app.hmvc[hmvcModulePath] = hmvcModule;
    app.use(mount(prefix, wrapHmvcMiddleware(hmvcModulePath, hmvcModule.middleware)));
  };

  app.mountHmvc('/', 'frontpage');

  if (process.env.NODE_ENV == 'development') {
    app.mountHmvc('/markup', 'markup');
  }

  app.mountHmvc('/auth', 'auth');
  app.csrf.addIgnorePath('/auth/login/:any*');


  app.mountHmvc('/getpdf', 'getpdf');

  app.mountHmvc('/payments', 'payments');
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
  app.mountHmvc('/', 'tutorial');


};
