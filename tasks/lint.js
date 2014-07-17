var gp = require('gulp-load-plugins')();
var gulp = require('gulp');
var log = require('javascript-log')(module);
var fs = require('fs');
var es = require('event-stream');
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
 * - caches successfully linted files
 * - dies with exit=1
 * on error
 */
module.exports = function(sources) {

  console.log("CACHE INIT");
  var cache = {};


  return function() {

    var start = new Date();
    return gulp.src(sources, {read: false})
      .pipe(gp.plumber())
      .pipe(through2.obj(function(source, enc, callback) {
        // pass down item from cache OR source
        log.debug("Cache lookup: " + source.path);
        if (cache[source.path] && source.stat.mtime <= cache[source.path].stat.mtime) {
          log.debug("Cache Hit: " + source.path);
          this.push(cache[source.path]);
          return callback();
        } else {
          log.debug("Cache Miss: " + source.path);
        }


        console.log("PASS-1 " + source.path);
        this.push(source);
        callback();
      }))
      .pipe(gp.if(function(file) {
        console.log(file.path, file.fromCache);
        return !file.fromCache;
      }, jshintChannel()))
      .pipe(through2.obj(function(source, enc, callback) {
        cache[source.path] = source;
        cache[source.path].fromCache = true;
        this.push(source);
        console.log("PASS-2 " + source.path);
        callback();
      }, function() {
        console.log("END");
      }))
      .pipe(gp.jshint.reporter('default'));

  };

};
