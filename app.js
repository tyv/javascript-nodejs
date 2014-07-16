"use strict";

const koa = require('koa');
const log = require('javascript-log')(module);

const app = koa();

function requireMiddleware(path) {
  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development') {
    app.use(function *(next) {
      log.debug("middleware " + path);
      yield next;
    });
  }
  return require(path)(app);
}


module.exports = function* () {

  // wait for DB to get connected before proceeding
  yield requireMiddleware('setup/mongoose');

  requireMiddleware('setup/stylus');

  requireMiddleware('setup/static');

  requireMiddleware('setup/errors');

  requireMiddleware('setup/logger');
  requireMiddleware('setup/bodyParser');
  requireMiddleware('setup/session');
  requireMiddleware('setup/render');
  requireMiddleware('setup/router');

  return app;
};
