const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
var fs = require('fs');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const watchify = require('watchify');
const browserify = require('browserify');
var config = require('config');
var notifier = require('node-notifier');
var log = require('log')();
var _ = require('lodash');
var path = require('path');
var through2 = require('through2');
var co = require('co');
var thunkify = require('thunkify');
var crypto = require('crypto');

//var requireify = require('requireify');
// should expose all modules to require, but missed part of them. buggy!

var browserifyJade = require('browserify-jade');

function updateClientVersions(path, version) {
  var versions;

  try {
    versions = require('client/versions.json');
  } catch(e) {
    versions = {};
  }

  versions[path] = version;
  fs.writeFileSync('./client/versions.json', JSON.stringify(versions));
}

function makeBundler(options) {

  // dst has same name as (single) src
  var opts = _.assign({}, options, {
    debug:        (process.env.NODE_ENV === 'development'),
    cache:        {},
    packageCache: {},
    fullPaths:    true,
    // uncompressed prelude (bundle-top) for debugging
    preludePath:  require.resolve('browser-pack/prelude'),
    prelude:      fs.readFileSync(require.resolve('browser-pack/prelude'), 'utf-8')
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


  bundler.rebundle = function(callback) {
    log.debug("browserify start: " + bundler._options.dst);
    this.bundle()
      .on('error', function(e) {
        gutil.log(e.message);

        notifier.notify({
          message: e
        });

        callback(); // let gulp know that we finished, otherwise it won't rerun us
      })
      .pipe(source(path.basename(this._options.dst)))
      .pipe(gp.if(process.env.NODE_ENV == 'production', gp.streamify(gp.uglify())))
      .pipe(gp.streamify(through2.obj(function collectJsVersions(file, enc, cb) {

        var d = new Date();
        var md5 = crypto.createHash('md5').update(file.contents).digest('hex').slice(-6);

        updateClientVersions('/js/' + path.basename(bundler._options.dst), md5);

        this.push(file);
        cb();

      })))
      .pipe(gulp.dest(path.dirname(this._options.dst)))
      .on('end', function() {
        gutil.log("browserify done: " + bundler._options.dst);
        callback();
      });
  };


  bundler.on('file', function(file, id) {
    log.trace(file, ':', id);
  });

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

  /*
   // watchify is buggy, see
   https://github.com/substack/watchify/issues/72
   https://github.com/substack/watchify/issues/77
   until fixed, can't use
   if (process.env.NODE_ENV == 'development') {
   bundler = watchify(bundler);
   }
   */

  return bundler;
}


function bundleVendor(callback) {
  // Not needed yet
  var vendor = ['jquery'];

  var bundler = makeBundler({
    entries: [],
    dst:     './public/js/vendor.js',
    require: vendor
  });

  bundler.rebundle(callback);
}

function bundleHead(callback) {

  // head.js does not use any polyfills etc
  var bundler = makeBundler({
    dst:       './public/js/head.js',
    // require['client/head'] did't work some time, because it put 'client/head' path, not full path into cache, and then require from another bundle looks for full path
    require:   ['client/head'],
    externals: ['auth/client'] // head needs authModal
  });
  // expose does not work with watchify
  // https://github.com/substack/watchify/issues/72#issuecomment-50747549
  bundler.rebundle(callback);
}

function bundleFooter(callback) {
  var bundler = makeBundler({
    dst:       './public/js/footer.js',
    require:   ['client/footer'],
    externals: ['client/head'] // already loaded
  });
  // expose does not work with watchify
  // https://github.com/substack/watchify/issues/72#issuecomment-50747549
  bundler.rebundle(callback);
}

function bundleHmvc(hmvcName, callback) {

  var bundler = makeBundler({
    dst:       './public/js/' + hmvcName + '.js',
    externals: ['client/head'], // already loaded, has Modal and other basic stuff
    require:   [hmvcName + '/client']
  });

  bundler.rebundle(callback);
}

module.exports = function() {

  return function(callback) { callback() };

  return function(callback) {


    co(function*() {

      yield thunkify(bundleHmvc)('auth');
      yield thunkify(bundleHmvc)('profile');
      yield thunkify(bundleHmvc)('tutorial');
      yield thunkify(bundleFooter)();
      yield thunkify(bundleHead)();

    })(callback);

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
