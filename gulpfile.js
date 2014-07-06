var gulp   = require('gulp');
var gulpTaskLint = require('javascript-gulp-task-lint');
var path = require('path');

gulp.task('lint', gulpTaskLint(['**/*.js', '!node_modules/**', '!app/**', '!tutorial/**']));

gulp.task('pre-commit', ['lint']);
