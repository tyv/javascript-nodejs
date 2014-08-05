var mount = require('koa-mount');
var path = require('path');

// mountHmvc(prefix, 'modulePath')
// is same as
// mount(prefix, require('modulePath').middleware),
// but also does
//   --> this.templatePaths.push(hmvcModule dirname) when entering middleware / pop on leaving
function mountHmvc(prefix, hmvcModulePath) {
  var hmvcModule = require(hmvcModulePath);
  var hmvcModuleDir = path.dirname(require.resolve(hmvcModulePath));

  return mount(prefix, function*(next) {
    var self = this;

    var hmvcTemplateDir = path.join(hmvcModuleDir, 'templates');
    var middleware = hmvcModule.middleware;

    // before entering middeware
    function apply() {
      self.templatePaths.push(hmvcTemplateDir);
    }

    // before leaving middleware
    function undo() {
      self.templatePaths.pop();
    }

    apply();

    yield* middleware.call(this, function* (){
      // when middleware does yield next, undo changes
      undo();
      yield* next;
      // ...then apply back, when control goes back after yield next
      apply();
    }.call(this));

    undo();

  });
}

module.exports = mountHmvc;
