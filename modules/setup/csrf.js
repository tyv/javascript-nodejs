const csrf = require('koa-csrf');
const Csrf = require('lib/csrf').Csrf;

// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  csrf(app);

  app.csrf = new Csrf();

  app.use(app.csrf.middleware());
};
