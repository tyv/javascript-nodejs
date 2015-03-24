
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/ebook', __dirname));

  // anon can do anything here
  app.csrfChecker.ignore.add('/ebook/:any*');

};

exports.onPaid = require('./lib/onPaid');
exports.createOrderFromTemplate = require('./lib/createOrderFromTemplate');
