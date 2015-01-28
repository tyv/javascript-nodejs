const Imagemin = require('imagemin');
const pngcrush = require('imagemin-pngcrush');
const es = require('event-stream');
const svgo = require('imagemin-svgo');
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

    return gulp.src(root + '/**/*.{svg,png,jpg,gif}')
      .pipe(es.map(function(image, cb) {
        gutil.log("minify " + image.path);

        var sizeBefore = image.stat.size;
        minifyImage(image.path, function() {
          var sizeAfter = fs.statSync(image.path).size;
          gutil.log(sizeBefore + " -> " + sizeAfter);
          cb();
        });

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

  imagemin.run(callback);

}
