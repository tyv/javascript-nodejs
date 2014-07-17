var gp = require('gulp-load-plugins')();
var gulp = require('gulp');
//var log = require('javascript-log')(module);
var fs = require('fs');
var getContents = require('vinyl-fs/lib/src/getContents');
var through2 = require('through2');
var lazypipe = require('lazypipe');

//log.debugOn();

var jshintChannel = lazypipe()
  // adding a pipeline step
  .pipe(getContents.bind(null, {})) // notice the stream function has not been called!
  .pipe(gp.jshint);


/**
 * Lint task
 * - caches jshint result on files until they are modified
 */
module.exports = function(sources) {

  var cache = {};

  return function() {

    var start = new Date();
    return gulp.src(sources, {read: false})
      .pipe(through2.obj(function(source, enc, callback) {
        // pass down a file from cache OR source if MISS
        if (cache[source.path] && source.stat.mtime <= cache[source.path].stat.mtime) {
          this.push(cache[source.path]);
          return callback();
        }

        this.push(source);
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
        this.push(source);
        callback();
      }, function() {
//        log.debug("END TIME " + (new Date() - start));
        this.emit('end');
      }))
      .pipe(gp.jshint.reporter('default'));

  };

};
