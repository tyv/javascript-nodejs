'use strict';

var views = require('koa-views');
var config = require('config');

module.exports = function render(app) {
  app.use(function *(next) {
    this.locals = { };

    if (process.env.NODE_ENV == 'development') {
      this.locals.pretty = true; // jade opts
      this.locals.compileDebug = true;
    }

    yield next;
  });

  app.use(views(config.template.path, config.template.options));
};

