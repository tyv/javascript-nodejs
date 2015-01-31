//require("time-require");

const config = require('config');

const log = require('log')('app', {bufferLowLevel: true});

if (process.env.NODE_ENV == 'production') {

  // only log.error in prod, otherwise just die
  process.on('uncaughtException', function(err) {
    // let bunyan handle the error
    log.error(err);
    process.exit(255);
  });

}


const koa = require('koa');
const app = koa();

app.log = log;

// trust all headers from proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

var requireHandler = require('lib/requireHandler')(app);


requireHandler('mongooseHandler');

requireHandler('requestId');
requireHandler('requestLog');

requireHandler('nocache');

/*
 app.id = Math.random();
 app.use(function*(next) {
 console.log(app.id);
 yield next;
 });
 */

//requireHandler('time');

// this middleware adds this.render method
// it is *before errorHandler*, because errors need this.render
requireHandler('render');

// errors wrap everything
requireHandler('errorHandler');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
requireHandler('accessLogger');

// before anything that may deal with body
// it parses JSON & URLENCODED FORMS,
// it does not parse form/multipart
requireHandler('bodyParser');

// parse FORM/MULTIPART
// (many tweaks possible, lets the middleware decide how to parse it)
requireHandler('multipartParser');

// right after parsing body, make sure we logged for development
requireHandler('verboseLogger');

if (process.env.NODE_ENV == 'development') {
//  app.verboseLogger.addPath('/:any*');
}

requireHandler('conditional');

requireHandler('session');

requireHandler('passport');

requireHandler('csrf');

requireHandler('paymentsMethods');

// Services that actually generate some stuff

requireHandler('frontpage');

if (process.env.NODE_ENV == 'development') {
  requireHandler('markup');
  requireHandler('dev');
}

requireHandler('users');

requireHandler('auth');

requireHandler('getpdf');
requireHandler('cache');
requireHandler('search');

requireHandler('profile');

requireHandler('payments');

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
requireHandler('tutorial');


requireHandler('404');

// wait for full app load and all associated warm-ups to finish
// mongoose buffers queries,
// so for TEST/DEV there's no reason to wait
// for PROD, there is a reason: to check if DB is ok before taking a request
app.waitBoot = function* () {

  for (var i = 0; i < app.handlers.length; i++) {
    var handler = app.handlers[i];
    if (!handler.boot) continue;
    yield* handler.boot();
  }

};

// adding middlewares only possible *before* app.run
// (before server.listen)
// assigns server instance (meaning only 1 app can be run)
//
// app.listen can also be called from tests directly (and synchronously), without waitBoot (many times w/ random port)
// it's ok for tests, db requests are buffered, no need to waitBoot

app.waitBootAndListen = function*() {
  yield* app.waitBoot();

  yield function(callback) {
    app.server = app.listen(config.server.port, config.server.host, callback);
  };

  log.info('App listen %s:%d', config.server.host, config.server.port);
};

app.close = function*() {
  log.info("Closing app server...");
  yield function(callback) {
    app.server.close(callback);
  };

  log.info("App connections are closed");

  for (var i = 0; i < app.handlers.length; i++) {
    var handler = app.handlers[i];
    if (!handler.close) continue;
    yield* handler.close();
  }

  log.info("App stopped");
};

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


