//var requireTree = require('require-tree');
//
//requireTree('./model');

var router = require('./router');

exports.middleware = router.middleware();

exports.Article = require('./models/article');
exports.Reference = require('./models/reference');
exports.Task = require('./models/task');
