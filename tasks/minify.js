const Imagemin = require('imagemin');
const pngquant = require('imagemin-pngquant');
const es = require('event-stream');
const path = require('path');
const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const fs = require('fs');

/**
 *
 * @param options
 *  options.root => the root to import from
 * @returns {Function}
 */
module.exports = function(options) {
  options = options || {};

  const root = options.root || require('yargs').argv.root;

  if (!root) {
    throw new Error("Root not set");
  }

  return function(callback) {

    gutil.log("minify " + root);

    return gulp.src('./**/*.{svg,png,jpg,gif}', {base: root})
      .pipe(gp.debug())
      .pipe(gp.imagemin({
        verbose: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use:         [pngquant()]
      }))
      .pipe(gulp.dest(root));
  };


};

