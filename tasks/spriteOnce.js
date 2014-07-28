const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function(callback) {
    return gp.stylusSprite(options).apply(this, arguments);
  };
};

