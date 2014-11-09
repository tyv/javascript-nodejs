exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

exports.middleware = require('lib/lazyRouter')('./router');

/*

 var middleware = null;

 exports.middleware = function*(next) {
 console.log("!!!!!!!!!");
 process.exit(1);
 if (!middleware) middleware = require('./router').middleware();
 middleware.call(this, next);
 }


 */
