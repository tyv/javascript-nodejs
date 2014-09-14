const gp = require('gulp-load-plugins')();
const _ = require('lodash');

module.exports = function(options) {

  var opts = _.assign({
    ext:    "js",
    nodeArgs: ['--debug', '--harmony']
  }, options);

  return function(callback) {
    gp.nodemon(opts);
  };
};
