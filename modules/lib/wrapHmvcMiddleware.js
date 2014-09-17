var path = require('path');

// wrap('modulePath')
// is same as
// require('modulePath').middleware,
// but also does
//   --> this.templatePaths.push(hmvcModule dirname) when entering middleware / pop on leaving
function wrapHmvcMiddleware(hmvcModulePath, hmvcMiddleware) {
  var hmvcModuleDir = path.dirname(hmvcModulePath);

  return function*(next) {
    var self = this;

    var hmvcTemplateDir = path.join(hmvcModuleDir, 'templates');

    // before entering middeware
    function apply() {
      self.templatePaths.push(hmvcTemplateDir);
    }

    // before leaving middleware
    function undo() {
      self.templatePaths.pop();
    }

    apply();

    yield* hmvcMiddleware.call(this, function* (){
      // when middleware does yield next, undo changes
      undo();
      yield* next;
      // ...then apply back, when control goes back after yield next
      apply();
    });

    undo();

  };
}

module.exports = wrapHmvcMiddleware;
