

exports.ExpiringDownloadLink = require('./models/expiringDownloadLink');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/download', __dirname));
};

