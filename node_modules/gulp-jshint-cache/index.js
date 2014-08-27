var gulp = require('gulp');
var path = require('path');
var gp = require('gulp-load-plugins')({
  config: path.join(__dirname, 'package.json')
});
var getContents = require('vinyl-fs/lib/src/getContents');
var through2 = require('through2');
var lazypipe = require('lazypipe');


/**
 * Lint task
 * - caches jshint result on files until they are modified
 */
module.exports = function(options) {

  var cache = {};

// read file and jshint - only when needed
  var jshintChannel = lazypipe()
    .pipe(getContents.bind(null, {})) // notice the stream function has not been called!
    .pipe(gp.jshint.bind(null, options.jshint));

  return function() {

    var hadErrors = false;

    // when running in watch, it's important not to read all files
    var stream = gulp.src(options.src, {read: false})
      .pipe(through2.obj(function(source, enc, callback) {
        // pass down a file from cache OR source if MISS
        if (cache[source.path] && source.stat.mtime <= cache[source.path].stat.mtime) {
          this.push(cache[source.path]);
        } else {
          this.push(source);
        }
        callback();
      }))
      .pipe(gp.if(function(file) {
        // IF file NOT from cache THEN read && jshint it
        return !file.fromLintCache;
      }, jshintChannel()))
      .pipe(through2.obj(function(source, enc, callback) {
        // cache the file
        cache[source.path] = source;
        cache[source.path].fromLintCache = true;

        if (!source.jshint.success) {
          hadErrors = true;
        }

        this.push(source);
        callback();
      }))
      .pipe(gp.jshint.reporter('default'));

    if (options.dieOnError) {
      stream
        // consume all
        .on('readable', function() {
          this.read()
        })
        // check the result
        .on('end', function() {
          if (hadErrors) process.exit(1);
        });
    }

    return stream;
  };

};
