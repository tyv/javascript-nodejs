const pathToRegexp = require('path-to-regexp');

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
      this.log.debug("verboseLogger test " + this.path + " against " + path);
      if (path.test(this.path)) {
        this.log.debug("verboseLogger match found, will log all");
        shouldLog = true;
        break;
      }
    }

    if (shouldLog) {
      this.log({reqVerbose: this.req});
    }

    yield* next;
  };

};

/*
VerboseLogger.prototype.log = function(context) {

  for (var name in context.req.headers) {
    console.log(name + ": " + context.req.headers[name]);
  }

  if (context.request.body) {
    console.log(context.request.body);
  }

};
*/

module.exports = VerboseLogger;
