/**
 * Custom application, inherits from Koa Application
 * Gets requireModules which adds a module to handlers.
 *
 * Handlers are called on:
 *   - init (sync) - initial requires
 *   - boot (async) - ensure ready to get a request
 *   - close (async) - close connections
 *
 * @type {Application}
 */

const KoaApplication = require('koa');
const inherits = require('inherits');

const log = require('log')('app', {bufferLowLevel: true});


module.exports = Application;

function Application() {
  KoaApplication.apply(this, arguments);
  this.handlers = {};
  this.log = log;
}

inherits(Application, KoaApplication);


// wait for full app load and all associated warm-ups to finish
// mongoose buffers queries,
// so for TEST/DEV there's no reason to wait
// for PROD, there is a reason: to check if DB is ok before taking a request
Application.prototype.waitBoot = function* () {


  for (var path in this.handlers) {
    var handler = this.handlers[path];
    if (!handler.boot) continue;
    yield* handler.boot();
  }

};

// adding middlewares only possible *before* app.run
// (before server.listen)
// assigns server instance (meaning only 1 app can be run)
//
// app.listen can also be called from tests directly (and synchronously), without waitBoot (many times w/ random port)
// it's ok for tests, db requests are buffered, no need to waitBoot

Application.prototype.waitBootAndListen = function*(host, port) {
  yield* this.waitBoot();

  yield function(callback) {
    this.server = this.listen(port, host, callback);
  }.bind(this);

  this.log.info('App listening %s:%d', host, port);
};

Application.prototype.close = function*() {
  this.log.info("Closing app server...");
  yield function(callback) {
    this.server.close(callback);
  }.bind(this);

  this.log.info("App connections are closed");

  for (var path in this.handlers) {
    var handler = this.handlers[path];
    if (!handler.close) continue;
    yield* handler.close();
  }

  this.log.info("App stopped");
};

Application.prototype.requireHandler = function(path) {

  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development' || process.env.LOG_LEVEL) {
    var log = this.log;
    this.use(function *(next) {
      log.trace("-> setup " + path);
      var d = new Date();
      yield* next;
      log.trace("<- setup " + path, new Date() - d);
    });
  }

  var handler = require(path);

  // init is always sync, for tests to run fast
  // boot is async
  if (handler.init) {
    handler.init(this);
  }

  this.handlers[path] = handler;

};