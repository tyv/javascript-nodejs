
var router = require('./router');

exports.middleware = router.middleware();

exports.html2search = require('./lib/html2search');