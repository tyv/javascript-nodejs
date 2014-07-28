const router = require('./router');

require('./lib/passport');

exports.middleware = router.middleware();
