const clsNamespace = require("continuation-local-storage").createNamespace("app");

exports.init = function(app) {

  app.use(function*(next) {
    var context = clsNamespace.createContext();
    clsNamespace.enter(context);

    try {
      clsNamespace.set('context', this);
      yield* next;
    } finally {
      // important: all request-related events must be finished within request
      // after request finished, the context is lost.
      clsNamespace.exit(context);
    }
  });

};
