const koaCsrf = require('koa-csrf');
const CsrfChecker = require('lib/csrfChecker');

// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  koaCsrf(app);

  app.csrfChecker = new CsrfChecker();

  app.use(app.csrfChecker.middleware());
};
