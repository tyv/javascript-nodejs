const koaCsrf = require('koa-csrf');
const pathToRegexp = require('path-to-regexp');

function CsrfChecker() {
  this.ignorePaths = [];
}

// csrf.addIgnore adds a path into "disabled csrf" list
CsrfChecker.prototype.addIgnorePath = function(path) {
  if (path instanceof RegExp) {
    this.ignorePaths.push(path);
  } else if (typeof path == 'string') {
    this.ignorePaths.push(pathToRegexp(path));
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

CsrfChecker.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') {
      return yield* next;
    }

    var checkCsrf = true;
    for (var i = 0; i < self.ignorePaths.length; i++) {
      var path = self.ignorePaths[i];
      this.log.debug("csrf test " + this.path + " against " + path);
      if (path.test(this.path)) {
        this.log.debug("csrf match found, disable csrf check");
        checkCsrf = false;
        break;
      }
    }

    // If test check CSRF only when "X-Test-Ignore-Csrf" header is set
    if (process.env.NODE_ENV == 'test') {
      if (!this.get('X-Test-Ignore-Csrf')) {
        checkCsrf = false;
      }
    }

    if (checkCsrf) {
      this.assertCSRF(this.request.body);
    }

    yield* next;
  };
};


// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  koaCsrf(app);

  app.csrfChecker = new CsrfChecker();

  app.use(app.csrfChecker.middleware());
};
