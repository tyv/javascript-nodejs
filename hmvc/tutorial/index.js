var requireTree = require('require-tree');

requireTree('./model');

var router = require('./router');

exports.middleware = router.middleware();
