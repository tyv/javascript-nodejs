const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const watchify = require('watchify');
const browserify = require('browserify');
var Notification = require('node-notifier');
var assert = require('assert');
var _ = require('lodash');
var path = require('path');

function makeBundler(options) {
  // dst has same name as (single) src

  var opts = _.assign({}, options, {
    debug: (process.env.NODE_ENV === 'development')
  });

  var bundler = browserify(opts);
  bundler.rebundle = function() {
    console.log(path.basename(this._options.dst));
    bundler.bundle()
      .pipe(source(path.basename(this._options.dst)))
      .pipe(gulp.dest(path.dirname(this._options.dst)));
  };

 // bundler.on('update', bundler.rebundle);

  return bundler;
}

module.exports = function() {
/*
  var externals = ['jquery'];

  var bundler = makeBundler({
    src: './app/js/vendor.js',
    dst: './www/js/vendor.js',
    require: externals
  });

  bundler = watchify(bundler);
  bundler.rebundle();

  var bundler = makeBundler({
    src: './app/js/head.js',
    dst: './www/js/head.js'
  });

  bundler = watchify(bundler);
  bundler.rebundle();

  */
  var bundler = makeBundler({
    src: './app/js/main.js',
    dst: './www/js/main.js'
  });
  bundler.rebundle();

  console.log("TEST");
/*
  bundler.on('prebundle', function(bundle) {
    for (var i = 0; i < externals.length; i++) {
      var external = externals[i];
      this.external(external);
    }
  });*/

};
