const gulp = require('gulp');
var buster = require('gulp-buster');
buster.config('length', 8);

module.exports = function(options) {

  return function() {
    return gulp.src(options.src, { cwd: options.cwd })
      .pipe(buster(options.dst))
      .pipe(gulp.dest('.'));
  };

};

