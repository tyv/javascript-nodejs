var Router = require('koa-router');

var glob = require('glob');
var path = require('path');
var router = module.exports = new Router();

var files = glob.sync(path.join('**', '*.jade'), {
  cwd: path.join(__dirname, 'templates')
});

files.forEach(function(relPath) {
  var url = relPath.replace('.jade', '');
  router.get('/' + url, function*() {
    this.body = this.render(url);
  });
});
