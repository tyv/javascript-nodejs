'use strict';

const formidable = require('koa-formidable');

module.exports = function (app) {
  app.use(formidable());
};