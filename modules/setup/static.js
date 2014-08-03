'use strict';


const favicon = require('koa-favicon');
const send = require('koa-send');
const path = require('path');


/**
 * koa-static is a thin wrapper around koa-send
 * Here we statically send all paths with extension.
 *
 * ...And if we fail, there is no big-nice-error-screen which is slow to render
 * just a simple default error message
 * @param app
 */
module.exports = function(app) {

  app.use(favicon());

  app.use(function*(next) {
    var opts = {
      root: 'www',
      index: 'index.html'
    };

    if (this.idempotent && path.extname(this.path) !== '') {
      var filePath = yield send(this, this.path, opts);
      if (filePath && path.extname(filePath) == '.js') {
        // usually the type is calculated in mime-types/lib/index.js
        // by exports.charset
        // it adds utf-8 to text/*
        // but it doesn't set right content-type for .js (application/javascript)
        // --> that's why I do that here
        this.response.type += '; charset=utf-8';
      }
      return;
    }

    yield* next;

  });

};
