const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const fs = require('fs');
const crypto = require('crypto');

module.exports = function(options) {

  function getAssetVersion(file) {
    if (process.env.NODE_ENV == 'development') {
      return fs.statSync(file).mtime.getTime().replace(/0+$/, '').slice(-8);
    } else {
      var buf = fs.readFileSync(file);
      return crypto.createHash('md5').update(buf).digest('hex').substring(0, 8);
    }
  }

  return function() {

    var nib = require('nib')();
    var asset = require('stylusAsset')({
      getVersion: getAssetVersion
    });

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

