const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  var opts = {
    ext:    "js",
    nodeArgs: ['--debug', '--harmony']
  };

  for (var key in options) {
    opts[key] = options[key];
  }

  return function(callback) {
    gp.nodemon(opts);
  };
};
