const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
const gutil = require('gulp-util');
const debug = require('gulp-debug');
const jshint = require('gulp-jshint');
const fs = require('fs');
const execSync = require('child_process').execSync;
const es = require('event-stream');
const cache = require('gulp-cache');
const getContents = require('vinyl-fs/lib/src/getContents');

/**
 * Lint task
 * - caches successfully linted files
 * - dies with exit=1
 * on error
 */
module.exports = function() {

  var totalLintErrors = 0;

  var lintSrcs = ['config', 'controllers', 'lib', 'renderer', 'routes', 'setup', 'tasks'].map(function (d) {
    return d + '/**/*.js';
  }).concat('*.js');

  const cacheOpts = {
    key: function(file) {
      return file.stat.mtime.getTime();
    },
    // cache based on contents of file by default
    // caches all results of task by default
    value:   function(jshintedFile) {
      return {
        fromCache: true,
        jshint: jshintedFile.jshint
      };
    }
  };


  // return stream, Orchestrator will consider the task finished when it ends
  return gulp.src(lintSrcs, {read: false})
    .pipe(cache(getContents().pipe(jshint(), cacheOpts))) // BROKEN
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