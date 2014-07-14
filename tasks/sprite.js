const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith');
const path = require('path');
const debug = require('gulp-debug');



module.exports = function() {

  // for canvas engine (fastest?) need
  // port install cairo
  // export PKG_CONFIG_PATH=/opt/local/lib/pkgconfig
  // npm i cairo
  // npm i gulp.spritesmith

  var spriteData = gulp.src('app/**/*.sprite')
    .pipe();

};

//
//
//module.exports = function() {
//
//  // for canvas engine (fastest?) need
//  // port install cairo
//  // export PKG_CONFIG_PATH=/opt/local/lib/pkgconfig
//  // npm i cairo
//  // npm i gulp.spritesmith

  var spriteData = gulp.src('app**/.sprite')
    .pipe(spritesmith({
      engine: 'pngsmith',
      imgName: 'sprite.png',
      cssName: 'sprite.styl',
      cssFormat: 'stylus',
      cssTemplate: path.join(__dirname, 'stylus.template.mustache'),
      cssVarMap: function (sprite) {
        // `sprite` has `name`, `image` (full path), `x`, `y`
        //   `width`, `height`, `total_width`, `total_height`
        // EXAMPLE: Prefix all sprite names with 'sprite-'
        sprite.name = 'sprite-' + sprite.name;
      }
    }));

//  spriteData.img.pipe(gulp.dest('./spr/img'));
//  spriteData.css.pipe(gulp.dest('./spr/css'));
//
//};
//
//
//
var spriteData =
  gulp.src('./src/assets/images/sprite/*.*') // путь, откуда берем картинки для спрайта
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.styl',
      cssFormat: 'stylus',
      algorithm: 'binary-tree',
      cssTemplate: 'stylus.template.mustache',
      cssVarMap: function(sprite) {
        sprite.name = 's-' + sprite.name
      }
    }));

//spriteData.img.pipe(gulp.dest('./built/assets/images/')); // путь, куда сохраняем картинку
//spriteData.css.pipe(gulp.dest('./src/assets/styles/')); // путь, куда сохраняем стили
