// must be above router, because router uses auth (which uses user)
// cyclic require here
exports.User = require('./models/user');

var router = require('./router');

exports.middleware = router.middleware();
