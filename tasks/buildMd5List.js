const gulp = require('gulp');
const buster = require('gulp-buster');
const gp = require('gulp-load-plugins')();
buster.config('length', 8);

module.exports = function(options) {

  return function() {
    return gulp.src(options.src, { cwd: options.cwd })
      .pipe(gp.debug())
      .pipe(buster(options.dst))
      .pipe(gulp.dest('.'));
  };

};

