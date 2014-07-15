const gulp   = require('gulp');
const debug = require('gulp-debug');
//const gulpTaskLint = require('./tasks/lint');
//const taskSprite = require('./tasks/sprite');
const path = require('path');
const execSync = require('child_process').execSync;
const es = require('event-stream');
var jshint = require('gulp-jshint');
const gutil = require('gulp-util');

gulp.task('lint', require('./tasks/lint'));


gulp.task('import', function(callback) {
  const mongoose = require('lib/mongoose');
  const taskImport = require('./tasks/import');

  taskImport({
    root: path.join(path.dirname(__dirname), 'javascript-tutorial'),
    updateFiles: true // skip same size files
    //minify: true // takes time(!)
  })(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});

/*
gulp.task('sprite', taskSprite);

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
