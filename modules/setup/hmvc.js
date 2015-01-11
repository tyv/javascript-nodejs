var mount = require('koa-mount');

// wrapHmvcMiddleware(path) is same as require(path).middleware, with additional pre/post-processing
var wrapHmvcMiddleware = require('lib/wrapHmvcMiddleware');

module.exports = function(app) {

  //app.use( mount('/auth', require('auth').middleware) )
  function mountHmvc(prefix, hmvcModulePath) {
    var middleware;
    // lazy require middleware, so that restarting node won't load all hmvc routes (slow for dev)
    app.use(mount(prefix,
        function*(next) {
          if (!middleware) {
            var resolvedModulePath = require.resolve(hmvcModulePath);
            var hmvcModule = require(hmvcModulePath);
            middleware = wrapHmvcMiddleware(resolvedModulePath, hmvcModule.middleware);
          }

          yield* middleware.call(this, next);
        }
    ));
  }

  mountHmvc('/', 'frontpage');

  if (process.env.NODE_ENV == 'development') {
    mountHmvc('/markup', 'markup');
    mountHmvc('/dev', 'dev');
  }

  mountHmvc('/users', 'users');
  app.multipartParser.addIgnorePath('/users/me/:any*');

  mountHmvc('/auth', 'auth');
  // no csrf check for guest endpoints (no generation of csrf for anon)
  app.csrfChecker.addIgnorePath('/auth/login/:any*');
  app.csrfChecker.addIgnorePath('/auth/register');
  app.csrfChecker.addIgnorePath('/auth/reverify');
  app.csrfChecker.addIgnorePath('/auth/forgot');
  app.csrfChecker.addIgnorePath('/auth/forgot-recover');


  mountHmvc('/getpdf', 'getpdf');
  mountHmvc('/cache', 'cache');
  mountHmvc('/search', 'search');

  mountHmvc('/profile', 'profile');

  mountHmvc('/payments', 'payments');
  app.csrfChecker.addIgnorePath('/payments/:any*');
  app.verboseLogger.addPath('/payments/:any*');

  /*
  app.use(mount('/webmoney', compose([payment.middleware, require('webmoney').middleware])));
  app.csrfChecker.addIgnorePath('/webmoney/:any*');
  app.verboseLogger.addPath('/webmoney/:any*');

  app.use(mount('/yandexmoney', compose([payment.middleware, require('yandexmoney').middleware])));
  app.csrfChecker.addIgnorePath('/yandexmoney/:any*');
  app.verboseLogger.addPath('/yandexmoney/:any*');

  app.use(mount('/payanyway', compose([payment.middleware, require('payanyway').middleware])));
  app.csrfChecker.addIgnorePath('/payanyway/:any*');
  app.verboseLogger.addPath('/payanyway/:any*');

  app.use(mount('/paypal', compose([payment.middleware, require('paypal').middleware])));
  app.csrfChecker.addIgnorePath('/paypal/:any*');
  app.verboseLogger.addPath('/paypal/:any*');
*/

  // stick to bottom to detect any not-yet-processed /:slug
  mountHmvc('/', 'tutorial');


};
