
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/getpdf', __dirname));
};

exports.onSuccess = require('./onSuccess');
