'use strict';

var views = require('koa-views');
var config = require('config');
var moment = require('moment');

module.exports = function render(app) {
  app.use(function *(next) {
    this.locals = { };

    if (process.env.NODE_ENV == 'development') {
      this.locals.pretty = true; // jade opts
    }

    this.locals.moment = moment;

    yield next;
  });

//  app.use(views(config.template.path, config.template.options));
};

