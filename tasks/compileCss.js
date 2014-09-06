const gulp = require('gulp');
const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function() {

    var nib = require('nib')();
    var asset = require('stylusAsset')();

    return gulp.src(options.src)
      // without plumber if stylus emits PluginError, it will disappear at the next step
      // plumber propagates it down the chain
      .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
      .pipe(gp.stylus({use: [nib, asset]}))
      .pipe(gp.autoprefixer("last 1 version"))
      .pipe(gp.if(process.env.NODE_ENV == 'production', gp.minifyCss()))
      .pipe(gulp.dest(options.dst));

  };


};

