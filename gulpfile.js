var gulp   = require('gulp');
var gulpTaskLint = require('javascript-gulp-task-lint');
var taskImport = require('./tasks/import');
var path = require('path');
var mongoose = require('lib/mongoose');

gulp.task('lint', function(callback) {
  gulpTaskLint(['**/*.js', '!node_modules/**', '!app/**', '!www/**'])(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});

gulp.task('pre-commit', ['lint']);

gulp.task('import', function(callback) {
  taskImport({
    root: '/var/site/js-dev/tutorial',
    update: true
    //minify: true // takes time(!)
  })(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});

