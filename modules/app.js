"use strict";

const koa = require('koa');
const log = require('js-log')();
const config = require('config');
const app = koa();

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

// usually nginx will handle this
requireSetup('setup/static');

// errors wrap everything
requireSetup('setup/errorHandler');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
requireSetup('setup/accessLogger');

// before anything that may deal with body
requireSetup('setup/bodyParser');

// right after parsing body, make sure we logged for development
requireSetup('setup/verboseLogger');

if (process.env.NODE_ENV == 'development') {
//  app.verboseLogger.addPath('/:any*');
}

requireSetup('setup/session');
requireSetup('setup/csrf');

requireSetup('setup/render');
requireSetup('setup/router');

if (process.env.NODE_ENV == 'test') {
  app.listen(config.port, config.host, function() {
    console.log("App listening...");
  });
}

module.exports = app;
