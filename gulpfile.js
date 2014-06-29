var gulp   = require('gulp');
var gutil = require('gulp-util');
var map = require('map-stream');
var jshint = require('gulp-jshint');

var exitCode = 0;

const lintDirs = 'lib,config,controllers,error,models,routes,setup'.split(',');

gulp.task('lint', function() {
  var totalLintErrors = null;

  var options = {
    maxerr: 25,
    latedef: true,
    browser: false,
    node: true,
    indent: 2,
    camelcase: true,
    newcap: true,
    undef: true,
    esnext: true
  };

  return gulp.src(lintDirs.map(function(dir) { return dir + '/**/*.js'; }))
    .pipe(jshint(options))
    .pipe(jshint.reporter('default'))
    .pipe(map(function (file, cb) {
      if (!file.jshint.success) {
        totalLintErrors += file.jshint.results.length;
        exitCode = 1;
      }
      cb(null, file);
    }))
    .on('end', function () {
      var errString = totalLintErrors + '';
      if (exitCode) {
        console.log(gutil.colors.magenta(errString), 'errors\n');
        gutil.beep();
      }
      if (exitCode) {
        process.emit('exit');
      }
    });
});

process.on('exit', function () {
  process.nextTick(function () {
    var msg = "gulp '" + gulp.seq + "' failed";
    console.log(gutil.colors.red(msg));
    process.exit(exitCode);
  });
});
