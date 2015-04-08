
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/', __dirname));

  // for "node" middleware which executes server.js inside the content
  addNodeIgnores(app);
};

// these urls may only contain example scripts for the "node" middleware
function addNodeIgnores(app) {
  app.csrfChecker.ignore.add('/task/:any*');
  app.csrfChecker.ignore.add('/article/:any*');
  app.multipartParser.ignore.add('/task/:any*');
  app.multipartParser.ignore.add('/article/:any*');
  app.bodyParser.ignore.add('/task/:any*');
  app.bodyParser.ignore.add('/article/:any*');
}


exports.Article = require('./models/article');
exports.ArticleRenderer = require('./renderer/articleRenderer');
exports.Reference = require('./models/reference');
exports.Task = require('./models/task');
exports.TaskRenderer = require('./renderer/taskRenderer');
