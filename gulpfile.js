const gulp   = require('gulp');
const gulpTaskLint = require('javascript-gulp-task-lint');
const taskImport = require('./tasks/import');
const path = require('path');
const mongoose = require('lib/mongoose');
const execSync = require('child_process').execSync;

gulp.task('lint', function(callback) {
  const files = execSync("git ls-files -m '*.js'", {encoding: 'utf-8'}).trim().split("\n");
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

