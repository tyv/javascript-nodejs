const koaCsrf = require('koa-csrf');
const PathListCheck = require('pathListCheck');

function CsrfChecker() {
  this.ignore = new PathListCheck();
}


CsrfChecker.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') {
      return yield* next;
    }

    var checkCsrf = true;

    if (!this.user) {
      checkCsrf = false;
    }

    if (self.ignore.check(this.path)) {
      checkCsrf = false;
    }

    // If test check CSRF only when "X-Test-Ignore-Csrf" header is set
    if (process.env.NODE_ENV == 'test') {
      if (!this.get('X-Test-Ignore-Csrf')) {
        checkCsrf = false;
      }
    }

    if (checkCsrf) {
      this.assertCSRF(this.request.body);
    } else {
      this.log.debug("csrf skip");
    }

    yield* next;
  };
};


// every request gets different this._csrf to use in POST
// but ALL tokens are valid
exports.init = function(app) {
  koaCsrf(app);

  app.use(function* setCsrfCookie(next) {
    // XSRF-TOKEN cookie name is used in angular by default
    if (this.req.user) {

      try {
        // if this doesn't throw, the user has a valid token in cookie already
        this.assertCsrf({_csrf: this.cookies.get('XSRF-TOKEN') });
      } catch(e) {
        // no token or invalid token (old session)
        this.cookies.set('XSRF-TOKEN', this.csrf, { httpOnly: false, signed: false });
      }

    }
    yield* next;
  });

  app.csrfChecker = new CsrfChecker();

  app.use(app.csrfChecker.middleware());
};
