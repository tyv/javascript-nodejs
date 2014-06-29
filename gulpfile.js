var jshint = require('gulp-jshint');
var gulp   = require('gulp');

const serverDirs = 'lib,config,controllers,error,models,routes,setup'.split(',');

gulp.task('lint', function() {
  return gulp.src(serverDirs.map(function(dir) { return dir + '/**/*.js'; }))
    .pipe(jshint({
      maxerr: 25,
      browser: false,
      node: true,
      indent: 2,
      camelcase: true,
      newcap: true,
      undef: true,
      esnext: true
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
});
