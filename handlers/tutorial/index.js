
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/', __dirname));
};


exports.Article = require('./models/article');
exports.Reference = require('./models/reference');
exports.Task = require('./models/task');
