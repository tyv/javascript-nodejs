exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

const router = require('./router');

require('./lib/passport');

exports.middleware = router.middleware();
