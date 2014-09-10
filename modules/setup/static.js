const favicon = require('koa-favicon');
const send = require('send');
const path = require('path');
const config = require('config');
const url = require('url');
const mime = require('mime-types');
const fs = require('mz/fs');

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

    yield staticMiddleware.call(this, next);

  });

};

var opts = {
  // no root, because I resolve the path manually
  maxAge:   process.env.NODE_ENV == 'production' ? '10d' : 0,
  dotfiles: 'deny'
};


function decode(filepath){
  try {
    return decodeURIComponent(filepath);
  } catch (err) {
    return null;
  }
}

function resolvePath(filepath) {

  // decode the path
  filepath = decode(filepath);

  if (filepath === null) return false;

  // null byte(s)
  if (~filepath.indexOf('\0')) return false;

  var root = path.normalize(config.publicRoot);
  // join / normalize from optional root dir
  filepath = path.normalize(path.join(config.publicRoot, filepath));

  // malicious path
  if (filepath != root && filepath.substr(0, root.length + 1) !== root + path.sep) {
    return false;
  }

  return filepath;
}

function* staticMiddleware(next) {

  var urlParsed = url.parse(this.req.url);
  var filepath = resolvePath(urlParsed.pathname);
  if (!filepath) {
    this.throw(404);
  }

  // strip version
  filepath = stripVersion(filepath);

  if (this.cookies.get('hires')) {
    filepath = yield try2xImage(filepath);
  }

  // use mime-types module instead of send built-in mime
  // (which doesn't show encoding on application/javascript)
  function onHeaders(res, filepath, stat) {
    res.setHeader('Content-Type', mime.contentType(path.basename(filepath)));

    // static fonts need this
    if ((urlParsed.protocol + '://' + urlParsed.host) == config.staticurl) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  send(this.req, filepath, opts)
    .on('headers', onHeaders)
    .pipe(this.res);

}

function stripVersion(filepath) {
  return filepath.replace(/\.v.*?\./, '.');
}

function* try2xImage(filepath) {
  var ext = path.extname(filepath).slice(1);

  if (~['jpg', 'png', 'gif'].indexOf(ext)) {
    var try2x = filepath.slice(0, -ext.length-1) + '@2x.' + ext;
    if (yield fs.exists(try2x)) {
      filepath = try2x;
    }
  }

  return filepath;
}
