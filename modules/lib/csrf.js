const pathToRegexp = require('path-to-regexp');
const log = require('js-log')();

function Csrf() {
  this.ignorePaths = [];
}


// csrf.addIgnore adds a path into "disabled csrf" list
Csrf.prototype.addIgnorePath = function(path) {
  if (path instanceof RegExp) {
    this.ignorePaths.push(path);
  } else if (typeof path == 'string') {
    this.ignorePaths.push(pathToRegexp(path));
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

Csrf.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') {
      return yield* next;
    }

    var checkCsrf = true;
    for (var i = 0; i < self.ignorePaths.length; i++) {
      var path = self.ignorePaths[i];
      log.debug("test " + this.req.url + " against " + path);
      if (path.test(this.req.url)) {
        log.debug("match found, disable csrf check");
        checkCsrf = false;
        break;
      }
    }

    if (checkCsrf) {
      this.assertCSRF(this.request.body);
    }

    yield* next;
  };
};

exports.Csrf = Csrf;
