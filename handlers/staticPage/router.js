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

/*
router.get('/go/webstorm', function() {
  this.status = 301;
  this.redirect('https://www.jetbrains.com/webstorm/?utm_source=javascript.ru&utm_medium=banner2&utm_campaign=webstorm');
});
  */