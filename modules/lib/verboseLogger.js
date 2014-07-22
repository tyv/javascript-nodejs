const pathToRegexp = require('path-to-regexp');
const log = require('js-log')();

function VerboseLogger() {
  this.logPaths = [];
}


// csrf.addIgnore adds a path into "disabled csrf" list
VerboseLogger.prototype.addPath = function(path) {
  if (path instanceof RegExp) {
    this.logPaths.push(path);
  } else if (typeof path == 'string') {
    this.logPaths.push(pathToRegexp(path));
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

VerboseLogger.prototype.middleware = function() {
  var self = this;

  return function*(next) {

    var shouldLog = false;
    for (var i = 0; i < self.logPaths.length; i++) {
      var path = self.logPaths[i];
      log.debug("test " + this.req.url + " against " + path);
      if (path.test(this.req.url)) {
        log.debug("match found, will log all");
        shouldLog = true;
        break;
      }
    }

    if (shouldLog) {
      self.log(this);
    }

    yield* next;
  };
};

VerboseLogger.prototype.log = function(context) {

  for (var name in context.req.headers) {
    console.log(name + ": " + context.req.headers[name]);
  }

  if (context.request.body) {
    console.log(context.request.body);
  }

};

exports.VerboseLogger = VerboseLogger;
