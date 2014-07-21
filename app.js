"use strict";

const koa = require('koa');
const log = require('js-log')();;


const app = koa();

function requireMiddleware(path) {
  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development') {
    app.use(function *(next) {
      log.debug("middleware " + path);
      yield next;
    });
  }
  require(path)(app);
}


requireMiddleware('setup/mongoose');

requireMiddleware('setup/static');

requireMiddleware('setup/errors');

requireMiddleware('setup/logger');

requireMiddleware('setup/bodyParser');

if (process.env.NODE_ENV == 'development') {
  requireMiddleware('setup/headersLogger');
  requireMiddleware('setup/bodyLogger');
}

requireMiddleware('setup/session');
requireMiddleware('setup/csrf');


requireMiddleware('setup/hmvc');
requireMiddleware('setup/render');
requireMiddleware('setup/router');

module.exports = app;

