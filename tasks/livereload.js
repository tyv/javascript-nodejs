var livereload = require('gulp-livereload');
var gulp = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash');

// options.watch must NOT be www/**, because that breaks (why?!?) supervisor reloading
// www/**/*.* is fine
module.exports = function(options) {

  // listen to changes after the file events finish to arrive
  // no one is going to livereload right now anyway
  return function(callback) {
    livereload.listen();

    // reload once after all scripts are rebuit
    livereload.changedSoon = _.throttle(livereload.changed, 500, {leading: false});
    //livereload.changedVerySoon = _.throttle(livereload.changed, 100, {leading: false});

    setTimeout(function() {
      gutil.log("livereload: listen on change " + options.watch);

      gulp.watch(options.watch).on('change', function(changed) {
        if (changed.path.match(/\.(js|map)/)) {
          // full page reload
          livereload.changedSoon(changed);
        } else {
          livereload.changed(changed);
        }
      });

    }, 1000);
  };
};


