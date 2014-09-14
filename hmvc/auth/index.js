const router = require('./router');

require('./lib/setup');

exports.middleware = router.middleware();
exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
