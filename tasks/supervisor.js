
const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function(callback) {
    gp.supervisor(options.cmd, {
      args:         [],
      watch:        options.watch,
      pollInterval: 100,
      extensions:   [ "js" ],
      debug:        true,
      harmony:      true
    });
  };
};
