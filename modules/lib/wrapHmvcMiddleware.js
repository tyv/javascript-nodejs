var path = require('path');

// wrap('modulePath')
// is same as
// require('modulePath').middleware,
// but also calls apply/undo upon entering/leaving the middleware
//   --> here it does: this.templatePaths.push(hmvcModule dirname)
function wrapHmvcMiddleware(hmvcModulePath, hmvcMiddleware) {

  var hmvcModuleDir = path.dirname(hmvcModulePath);

  return function*(next) {
    var self = this;

    var hmvcTemplateDir = path.join(hmvcModuleDir, 'templates');

    // before entering middeware
    function apply() {
      self.templatePath = hmvcTemplateDir;
    }

    // before leaving middleware
    function undo() {
      delete self.templatePath;
    }

    apply();

    yield* hmvcMiddleware.call(this, function* (){
      // when middleware does yield next, undo changes
      undo();
      yield* next;
      // ...then apply back, when control goes back after yield next
      apply();
    }());

    undo();

  };
}

module.exports = wrapHmvcMiddleware;
