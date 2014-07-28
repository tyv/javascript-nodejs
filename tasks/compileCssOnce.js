const gulp = require('gulp');
const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function() {

    return gulp.src(options.src)
      // without plumber if stylus emits PluginError, it will disappear at the next step
      // plumber propagates it down the chain
      .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
      .pipe(gp.stylus({use: [require('nib')()]}))
      .pipe(gp.autoprefixer("last 1 version"))
      .pipe(gulp.dest(options.dst));
  };


};

