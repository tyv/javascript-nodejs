
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/getpdf', __dirname));

  // anon can do anything here
  app.csrfChecker.ignore.add('/getpdf/:any*');

};

exports.onSuccess = require('./onSuccess');
