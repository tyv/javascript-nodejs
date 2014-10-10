// router middleware which does require() on first activation
// instead of:
//   require('./router').middleware()
// do:
//   require('lib/lazyRouter')('./router')
module.exports = function(routerModulePath) {
  var middleware = null;

  return function*(next) {
    if (!middleware) {
      middleware = module.parent.require(routerModulePath).middleware();
    }
    yield* middleware.call(this, next);
  };

};


delete require.cache[__filename];
