const csrf = require('koa-csrf');

// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  csrf(app);

  if (!app.noCsrf) app.noCsrf = [];

  app.use(function* (next) {
    // skip these methods
    if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') {
      return yield* next;
    }

    // don't check filtered urls
    // e.g for access from outside non-browser apis
    var checkCsrf = true;

    for (var i=0; i<app.noCsrf.length; i++) {
      var filter = app.noCsrf[i];
      if (typeof filter == 'string') {
        if (this.req.url == filter) {
          checkCsrf = false;
        }
      } else if (filter instanceof RegExp) {
        if (filter.test(this.req.url)) {
          checkCsrf = false;
        }
      } else {
        throw new Error("unsupported filter " + filter);
      }
    }

    if (checkCsrf) {
      this.assertCSRF(this.request.body);
    }

    yield* next;

  });
};
