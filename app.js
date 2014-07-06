"use strict";

const koa = require('koa');
const log = require('lib/log')(module);

const app = koa();

require('models');

function requireMiddleware(path) {
  app.use(function *(next) {
    log.debug("middleware " + path);
    yield next;
  });
  require(path)(app);
}

requireMiddleware('setup/stylus');

requireMiddleware('setup/static');

requireMiddleware('setup/errors');

requireMiddleware('setup/logger');
requireMiddleware('setup/bodyParser');
requireMiddleware('setup/session');
requireMiddleware('setup/render');
requireMiddleware('setup/router');

requireMiddleware('./routes');

module.exports = app;
