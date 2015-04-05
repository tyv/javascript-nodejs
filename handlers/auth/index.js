exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {

  require('./strategies');

  app.use( mountHandlerMiddleware('/auth', __dirname) );

  // no csrf check for guest endpoints (no generation of csrf for anon)
  app.csrfChecker.ignore.add('/auth/login/:any*');
  app.csrfChecker.ignore.add('/auth/register');
  app.csrfChecker.ignore.add('/auth/reverify');
  app.csrfChecker.ignore.add('/auth/forgot');
  app.csrfChecker.ignore.add('/auth/forgot-recover');

};



