const Imagemin = require('imagemin');
const pngcrush = require('imagemin-pngcrush');
const es = require('event-stream');
const svgo = require('imagemin-svgo');
const path = require('path');
const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const gutil = require('gulp-util');

/**
 *
 * @param options
 *  options.root => the root to import from
 * @returns {Function}
 */
module.exports = function(options) {
  const root = options.root;

  return function(callback) {

    return gulp.src(options.root + '/**/*.{svg,png,jpg,gif}')
      .pipe(es.map(function(image, cb) {
        gutil.log("minify " + image.path);
        minifyImage(image.path, cb);
      }));
  };


};


function minifyImage(imagePath, callback) {

  var plugin;
  switch (path.extname(imagePath)) {
  case '.jpg':
    plugin = Imagemin.jpegtran({ progressive: true });
    break;
  case '.gif':
    plugin = Imagemin.gifsicle({ interlaced: true });
    break;
  case '.png':
    plugin = pngcrush({ reduce: true });
    break;
  case '.svg':
    plugin = svgo({});
    break;
  }

  var imagemin = new Imagemin()
    .src(imagePath)
    .dest(imagePath)
    .use(plugin);

  imagemin.optimize(callback);

}
