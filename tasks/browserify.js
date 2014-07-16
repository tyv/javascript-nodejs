const gp = require('gulp-load-plugins')();
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const es = require('event-stream');
const watchify = require('watchify');

/*
var w;

function bundler(file) {
  if (!w) {
    w = watchify({
      entries: [file.path], //file.contents may be used if {buffer: false} is set
      extensions:['.jsx']
    });
    w.on('log', $.util.log)
      .on('update', function() {
        gulp.start('scripts');
      });
  }

  var stream = w.bundle();
  file.contents = stream;

}


module.exports = function(options) {

  const bundlerFactory = options.watch ? require("watchify") : require("browserify");

  var bundler;

  gulp.src(options.src, {read: false})
    .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
    .pipe(es.map(function(file, callback) {
      if (!bundler) {
        gp.util.log("Starting browserify");
        bundler = bundlerFactory({entries: [file.path]})
        bundler
          .on("log", gp.util.log)
          .on("update", function() {
            gulp.start("scripts");
          });

        bundler.transform(require("reactify"))
        // bundler.add(es6ify.runtime)
        var es6ify = require("es6ify")
        es6ify.traceurOverrides = {experimental: true}
        bundler.transform(es6ify)

        if (opts.minify) {
          bundler.transform(require("uglifyify"))
        }
      }

      var stream = bundler.bundle()
      file.contents = stream
    }))
    .pipe(gulp.dest("./dist/"))
}
*/


module.exports = function(options) {

  return function() {

    return gulp.src(options.src, {read: false})
      .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
      .pipe(gp.tap(function(file) {

        const bundler = watchify({entries: [file.path]});

        bundler
          .on("log", gp.util.log)
          .on("update", rebundle);

        function rebundle() {
          return bundler.bundle({debug: true})
            .pipe(source('base.js'))
            .pipe(gulp.dest(options.dst));
        }

        return rebundle();
      }));
  };

};
