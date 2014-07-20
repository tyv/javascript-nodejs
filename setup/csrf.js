const csrf = require('koa-csrf');

// every request gets different this._csrf to use in POST
// but ALL tokens are valid
module.exports = function(app) {
  csrf(app);

//  manual check to skip api calls
//  app.use(csrf.middleware);
};
