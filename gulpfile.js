const gulp   = require('gulp');
const debug = require('gulp-debug');
const gulpTaskLint = require('javascript-gulp-task-lint');
const taskImport = require('./tasks/import');
const path = require('path');
const mongoose = require('lib/mongoose');
const execSync = require('child_process').execSync;
const spritesmith = require('gulp.spritesmith');

gulp.task('lint', function(callback) {
  const files = execSync("git ls-files -m '*.js'", {encoding: 'utf-8'})
    .trim()
    .split("\n")
    .filter(function(s) { return s; });
  gulpTaskLint(files)(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });

  //gulpTaskLint(['**/*.js', '!node_modules/**', '!app/**', '!www/**'])(function() {
});

gulp.task('pre-commit', ['lint']);

gulp.task('import', function(callback) {
  taskImport({
    root: '/var/site/js-dev/tutorial',
    updateFiles: true // skip same size files
    //minify: true // takes time(!)
  })(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});


gulp.task('sprite', function() {

  // for canvas engine (fastest?) need
  // port install cairo
  // export PKG_CONFIG_PATH=/opt/local/lib/pkgconfig
  // npm i cairo
  // npm i gulp.spritesmith
  
  var spriteData = gulp.src('app/**/*.sprite/*.png')
    .pipe(spritesmith({
      engine: 'pngsmith',
      imgName: 'sprite.png',
      cssName: 'sprite.styl',
      cssFormat: 'stylus'
    }));

  spriteData.img.pipe(gulp.dest('./spr/img'));
  spriteData.css.pipe(gulp.dest('./spr/css'));

});

/*
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/***.sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.styl',
    cssVarMap: function (sprite) {
      // `sprite` has `name`, `image` (full path), `x`, `y`
      //   `width`, `height`, `total_width`, `total_height`
      // EXAMPLE: Prefix all sprite names with 'sprite-'
      sprite.name = 'sprite-' + sprite.name;
    }
  }));
  spriteData.img.pipe(gulp.dest('path/to/image/folder/'));
  spriteData.css.pipe(gulp.dest('path/to/styl/folder/'));
});
*/
