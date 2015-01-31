exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {

  app.use( mountHandlerMiddleware('/auth', __dirname) );

  // no csrf check for guest endpoints (no generation of csrf for anon)
  app.csrfChecker.addIgnorePath('/auth/login/:any*');
  app.csrfChecker.addIgnorePath('/auth/register');
  app.csrfChecker.addIgnorePath('/auth/reverify');
  app.csrfChecker.addIgnorePath('/auth/forgot');
  app.csrfChecker.addIgnorePath('/auth/forgot-recover');

};



