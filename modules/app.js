"use strict";

require('lib/debug');

const log = require('log')('app', {bufferLowLevel : true});

process.on('uncaughtException', function(err) {
  // let bunyan handle the error
  log.error(err);
  process.exit(255);
});

const koa = require('koa');
const config = require('config');
const mongoose = require('config/mongoose');
const app = koa();

app.log = log;

// trust all headers from proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

function requireSetup(path) {
  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development') {
    app.use(function *(next) {
      log.debug("-> setup " + path);
      yield next;
      log.debug("<- setup " + path);
    });
  }
  require(path)(app);
}

requireSetup('setup/requestId');
requireSetup('setup/requestLog');

// usually nginx(or varnish) will handle this before node
// that's why we put it at the top
requireSetup('setup/static');

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
requireSetup('setup/httpPostParser');

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
// mongoose buffers queries, so for tests there's no reason to wait
// for PROD, there is a reason: to check if DB is ok.
app.waitBoot = function* () {
  yield function(callback) {
    mongoose.waitConnect(callback);
  };
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
    app.server = app.listen(config.port, config.host, callback);
  };

  log.info('App listen %s:%d', config.host, config.port);
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


module.exports = app;


