/*
const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
const fs = require('fs');
const execSync = require('child_process').execSync;
const es = require('event-stream');
const getContents = require('vinyl-fs/lib/src/getContents');

*/
/**
 * Lint task
 * - dies with exit=1
 * on error
 *//*

module.exports = function(srcs) {

  return function() {
    var totalLintErrors = 0;

    // return stream, Orchestrator will consider the task finished when it ends
    return gulp.src(srcs)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(es.map(function(file, cb) {
        if (!file.jshint.success) {
          totalLintErrors += file.jshint.results.length;
        }
        cb(null, file);
      }))
      .on('end', function() {
        if (totalLintErrors) {
          process.exit(1);
        }
      });
  };
};
*/
