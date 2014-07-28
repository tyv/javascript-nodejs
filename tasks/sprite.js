
const gulp = require('gulp');

module.exports = function(options) {
  return function(callback) {
    if (process.env.NODE_ENV == 'development') {
      gulp.watch(options.watch, ['app:sprite']);
    } else {
      callback();
    }
  };
};
