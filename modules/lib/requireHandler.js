
module.exports = function(app) {

  app.handlers = app.handlers || [];

  return function(path) {

    // if debug is on => will log the middleware travel chain
    if (process.env.NODE_ENV == 'development' || process.env.LOG_LEVEL) {
      app.use(function *(next) {
        app.log.trace("-> setup " + path);
        var d = new Date();
        yield* next;
        app.log.trace("<- setup " + path, new Date() - d);
      });
    }

    var serverModule = require(path);

    // init is always sync, for tests to run fast
    // boot is async
    if (serverModule.init) serverModule.init(app);

    app.handlers.push(serverModule);

  };

};