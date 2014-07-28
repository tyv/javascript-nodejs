var livereload = require('gulp-livereload');
var gulp = require('gulp');
var gutil = require('gulp-util');

// options.watch must NOT be www/**, because that breaks (why?!?) supervisor reloading
// www/**/*.* is fine
module.exports = function(options) {

  // listen to changes after 7 secs, to let initial jobs finish
  // no one is going to livereload right now anyway
  return function(callback) {
    livereload.listen();
    setTimeout(function() {
      gutil.log("livereload: deferred listen on change " + options.watch);
      gulp.watch(options.watch).on('change', livereload.changed);
    }, 7000);
  };
};


