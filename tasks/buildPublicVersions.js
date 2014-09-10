const gulp = require('gulp');
const buster = require('gulp-buster');
const gp = require('gulp-load-plugins')();
const fs = require('fs');

buster.config('length', 8);

buster.config('algo',
    process.env.NODE_ENV == 'production' ? 'md5' :
  function(file) { return file.stat.mtime.getTime().toString().replace(/0+$/, ''); });

/**
 * This task may run multiple times in watch, because FSEvents come after latency,
 * and sometimes the come after the task has finished
 */
module.exports = function(options) {

  return function() {
    return gulp.src(options.src, { cwd: options.cwd, read: (process.env.NODE_ENV == 'production') })
      .pipe(buster(options.dst))
      .pipe(gulp.dest('.'));
  };

};

