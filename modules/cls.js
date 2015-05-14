// This module initializes CLS
// and throws in additional modules to integrate it w/ other libs if needed

const clsNamespace = require("continuation-local-storage").createNamespace("app");

// Must teach bluebird work with CLS
// mz/fs uses bluebird by default if installed
// something else installs bluebird, so it gets used
// if I don't teach bluebird here, it won't keep CLS context, then yield fs.stat will spoil context
require('cls-bluebird')(clsNamespace);

exports.init = function(app) {

  app.use(function*(next) {
    var context = clsNamespace.createContext();
    clsNamespace.enter(context);

    // some modules like accessLogger await for this.res.on('finish'/'close'),
    // so let's bind these emitters to keep CLS context in handlers
    clsNamespace.bindEmitter(this.req);
    clsNamespace.bindEmitter(this.res);

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
