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
const mongoose = require('lib/mongoose');
const app = koa();

app.log = log;

// trust all headers from proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

function requireSetup(path) {
  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development' || process.env.LOG_LEVEL) {
    app.use(function *(next) {
      log.trace("-> setup " + path);
      var d = new Date();
      yield* next;
      log.trace("<- setup " + path, new Date() - d);
    });
  }
  require(path)(app);
}

requireSetup('setup/requestId');
requireSetup('setup/requestLog');

requireSetup('setup/nocache');

/*
 app.id = Math.random();
 app.use(function*(next) {
 console.log(app.id);
 yield next;
 });
 */

//requireSetup('setup/time');

// this middleware adds this.render method
// it is *before errorHandler*, because errors need this.render
requireSetup('setup/render');

// errors wrap everything
requireSetup('setup/errorHandler');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
requireSetup('setup/accessLogger');

// before anything that may deal with body
// it parses JSON & URLENCODED FORMS,
// it does not parse form/multipart
requireSetup('setup/bodyParser');

// parse FORM/MULTIPART
// (many tweaks possible, lets the middleware decide how to parse it)
requireSetup('setup/multipartParser');

// right after parsing body, make sure we logged for development
requireSetup('setup/verboseLogger');

if (process.env.NODE_ENV == 'development') {
//  app.verboseLogger.addPath('/:any*');
}

requireSetup('setup/conditional');

requireSetup('setup/session');

requireSetup('setup/passport');

requireSetup('setup/csrf');

requireSetup('setup/paymentsMethods');

requireSetup('setup/hmvc');

// by default if the router didn't find anything => it yields to next middleware
// so I throw error here manually
app.use(function* (next) {
  yield* next;

  if (this.status == 404) {
    // still nothing found? let default errorHandler show 404
    this.throw(404);
  }
});

// wait for full app load and all associated warm-ups to finish
// mongoose buffers queries,
// so for TEST/DEV there's no reason to wait
// for PROD, there is a reason: to check if DB is ok before taking a request
var elasticClient = require('elastic').client;
app.waitBoot = function* () {

  if (process.env.NODE_ENV == 'production') {
    yield function(callback) {
      mongoose.waitConnect(callback);
    };

    /* in ebook no elasticsearch
    var elastic = elasticClient();
    yield elastic.ping({
      requestTimeout: 1000
    });
    */
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

  yield function(callback) {
    mongoose.disconnect(callback);
  };
  log.info("App stopped");
};

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


