const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
var fs = require('fs');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const watchify = require('watchify');
const browserify = require('browserify');
var config = require('config');
var Notification = require('node-notifier');
var assert = require('assert');
var _ = require('lodash');
var path = require('path');
var browserifyJade = require('browserify-jade');

//var requireify = require('requireify'); // should expose all modules to require, but missed part of them. buggy!


// TODO: add uglify if not development
function makeBundler(options) {

  // dst has same name as (single) src
  var opts = _.assign({}, options, {
    debug:        (process.env.NODE_ENV === 'development'),
    cache:        {},
    packageCache: {},
    fullPaths:    true,
    // uncompressed prelude (bundle-top) for debugging
    preludePath: require.resolve('browser-pack/prelude'),
    prelude: fs.readFileSync(require.resolve('browser-pack/prelude'), 'utf-8')
  });

  var bundler = browserify(opts);

  // usually transforms work only inside the current package
  // that is: not for node_modules/*
  // but we use node_modules for hmvc apps, which need transforms
  //  --> that's why we need to use global
  // also see the question here: http://stackoverflow.com/questions/24152511/how-should-i-structure-my-modules-in-order-to-make-use-of-hbsfy-and-browserify
  // P.S. `browjadify` may be better cause it works on server-side too (w/o browserify)
  bundler.transform({global: true}, browserifyJade.jade({
    pretty:        false,
    compileDebug:  false,
    templatePaths: [path.join(config.projectRoot, 'templates')],
    parser:        require('lib/jadeParserMultipleDirs')
  }));

  bundler.rebundle = function() {
    this.bundle()
      .on('error', function(e) {
        gutil.log(e.message);
        new Notification().notify({
          message: e
        });
      })
      .pipe(source(path.basename(this._options.dst)))
      .pipe(gp.if(process.env.NODE_ENV == 'production', gp.streamify(gp.uglify())))
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
      dst:     './public/js/head.js',
      // require['client/head'] did't work some time, because it put 'client/head' path, not full path into cache, and then require from another bundle looks for full path
      require: ['client/head'],
      externals: ['auth/client/authModal']
    });
    // expose does not work with watchify
    // https://github.com/substack/watchify/issues/72#issuecomment-50747549
    bundler.rebundle();


    var bundler = makeBundler({
//      entries:   'auth/client/authModal',
      dst:       './public/js/auth/authModal.js',
      externals: ['client/head'],
      require: ['auth/client/authModal']
    });

    bundler.rebundle();
//
//    /*
//     var bundler = makeBundler({
//     entries: './client/navigation.js',
//     dst:     './public/js/navigation.js'
//     });
//
//     bundler.rebundle();
//     */
//
//    var bundler = makeBundler({
//      entries:   './client/main.js',
//      dst:       './public/js/main.js',
//      externals: vendor
//    });
//
//    bundler.rebundle();
  };
};
