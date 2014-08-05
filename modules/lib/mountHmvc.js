var mount = require('koa-mount');
var path = require('path');

// same as mount(prefix, hmvcModule.middleware),
// but also
//   --> this.templatePaths.push(hmvcModule dirname) when entering middleware
function mountHmvc(prefix, hmvcModule) {
  return mount(prefix, function*(next) {
    var self = this;

    debugger;
    var hmvcTemplateDir = path.join(path.dirname(hmvcModule.filename), 'templates');
    var middleware = hmvcModule.middleware;

    // before entering middeware
    function apply() {
      self.templatePaths.push(hmvcTemplateDir);
    }

    function undo() {
      self.templatePaths.pop();
    }

    apply();

    yield* middleware.call(this, function *(){
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
