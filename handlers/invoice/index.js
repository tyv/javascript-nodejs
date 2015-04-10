
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/invoice', __dirname));

  // anon can do anything here
  app.csrfChecker.ignore.add('/invoice/:any*');

};

exports.onPaid = require('./lib/onPaid');
exports.createOrderFromTemplate = require('./lib/createOrderFromTemplate');
