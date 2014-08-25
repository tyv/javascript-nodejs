const koaCsrf = require('koa-csrf');
const Csrf = require('lib/csrf');

// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  koaCsrf(app);

  app.csrf = new Csrf();

  app.use(app.csrf.middleware());
};
