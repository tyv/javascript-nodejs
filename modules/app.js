"use strict";

require('lib/debug');
const koa = require('koa');
const log = require('js-log')();
const config = require('config');
const mongoose = require('config/mongoose');
const app = koa();

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

// usually nginx will handle this before node
// that's why we put it at the top
requireSetup('setup/static');

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

requireSetup('setup/session');

requireSetup('setup/passport');

requireSetup('setup/csrf');

requireSetup('setup/payments');

requireSetup('setup/router');

// wait for full app load and all associated warm-ups to finish
// mongoose buffers queries, so for tests there's no reason to wait
// for PROD, there is a reason: to check if DB is ok.
app.waitBoot = function* () {
  yield function(callback) {
    mongoose.waitConnect(callback);
  };
};

// adding middlewares only possible before app.run
app.run = function*() {
  yield* app.waitBoot();

  yield function(callback) {
    app.listen(config.port, config.host, function() {
      log.info('App listen %s:%d', config.host, config.port);
      callback();
    });
  };
};

module.exports = app;

