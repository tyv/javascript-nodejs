
var router = require('./router');

exports.middleware = router.middleware();

exports.onSuccess = require('./onSuccess');
