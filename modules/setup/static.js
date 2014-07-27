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
      yield send(this, this.path, opts);
      return;
    }

    yield* next;

  });

};
