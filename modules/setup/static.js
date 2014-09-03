const favicon = require('koa-favicon');
const send = require('send');
const path = require('path');
const config = require('config');
const url = require('url');
const mime = require('mime-types');

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

    if (!this.idempotent) {
      yield next;
      return;
    }

    // all extensions are considered static (oh really?)
    if (path.extname(this.path) === '') {
      yield next;
      return;
    }

    // don't use koa to respond
    this.respond = false;
    // by default koa sets res.statusCode = 404 (in case nothing executes that's fine),
    // but normally it's 200
    this.res.statusCode = 200;

    var opts = {
      root:     config.publicRoot,
      index:    'index.html',
      maxAge:   '1y',
      dotfiles: 'deny'
    };

    // use mime-types module instead of send built-in mime
    // (which doesn't show encoding on application/javascript)
    function onHeaders(res, filePath, stat) {
      res.setHeader('Content-Type', mime.contentType(path.basename(filePath)));
    }

    send(this.req, url.parse(this.req.url).pathname, opts)
      .on('headers', onHeaders)
      .pipe(this.res);

  });

};
