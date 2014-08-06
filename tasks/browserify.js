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

// TODO: add uglify if not development
function makeBundler(options) {

  // dst has same name as (single) src
  var opts = _.assign({}, options, {
    debug: (process.env.NODE_ENV === 'development'),
    cache: {},
    packageCache: {},
    fullPaths: true
  });

  var bundler = browserify(opts);
  bundler.rebundle = function() {
    this.bundle()
      .on('error', function(e) {
        gutil.log(e.message);
        new Notification().notify({
          message: e
        });
      })
      .pipe(source(path.basename(this._options.dst)))
      .pipe(gulp.dest(path.dirname(this._options.dst)));
  };
  bundler.on('update', bundler.rebundle);
  bundler.on('log', function(msg) {
    gutil.log("browserify: " + msg);
  });

  if (options.externals) {
    for (var i = 0; i < options.externals.length; i++) {
      var external = options.externals[i];
      bundler.external(external);
    }
  }

  if (process.env.NODE_ENV == 'development') {
    bundler = watchify(bundler);
  }

  return bundler;
}

module.exports = function() {

  return function(callback) {

    var vendor = ['jquery'];

    var bundler = makeBundler({
      entries: [],
      dst:     './public/js/vendor.js',
      require: vendor
    });

    bundler.rebundle();

    // head.js does not use any polyfills etc
    var bundler = makeBundler({
      entries: './frontend/js/head',
      dst:     './public/js/head.js'
    });

    bundler.rebundle();


    var bundler = makeBundler({
      entries: './frontend/js/navigation.js',
      dst:     './public/js/navigation.js'
    });

    bundler.rebundle();


    var bundler = makeBundler({
      entries: './frontend/js/main.js',
      dst:     './public/js/main.js',
      externals: vendor
    });


    bundler.rebundle();
  };
};
