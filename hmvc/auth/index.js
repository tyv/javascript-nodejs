exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

exports.middleware = require('lib/lazyRouter')('./router');
