/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const runSequence = require('run-sequence');
const gulpWatcher = require('./tasks/gulpWatcher');

//Error.stackTraceLimit = Infinity;
//require('trace');
//require('clarify');

process.on('uncaughtException', function(err) {
  // not bunyan, because the 'log' module may be not linked yet
  console.log(err);
  process.exit(255);
});

gulp.executing = [];

gulp.on('task_start', function(msg) {
  gulp.executing.push(msg.task);
});

gulp.on('task_stop', function(msg) {
  gulp.executing.splice(gulp.executing.indexOf(msg.task), 1);
 // console.log(gulp.executing.join(','));
});


const jsSources = [
  'hmvc/**/*.js', 'modules/**/*.js', 'tasks/**/*.js', '*.js'
];

function lazyRequireTask(path) {
  var args = [].slice.call(arguments, 1);

  return function(callback) {
    var task = require(path).apply(this, args);
    return task(callback);
  };
}


gulp.task('lint-once', lazyRequireTask('./tasks/lint', { src: jsSources }));
gulp.task('lint-or-die', lazyRequireTask('./tasks/lint', { src: jsSources, dieOnError: true }));

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', lazyRequireTask('./tasks/loadDb'));

gulp.task("nodemon", lazyRequireTask('./tasks/nodemon', {
  script: "./bin/server",
  ignore: '**/client/', // ignore hmvc apps client code
  watch:  ["hmvc", "modules"]
}));

gulp.task("client:livereload", lazyRequireTask("./tasks/livereload", { watch: "public/{i,img,js,styles}/**/*.*" }));

gulp.task('link-modules', lazyRequireTask('./tasks/linkModules', { src: ['client', 'modules/*', 'hmvc/*'] }));

gulp.task('watch', function(callback) {
  gulpWatcher({ root: __dirname });
});


gulp.task("client:sync-resources-once", lazyRequireTask('./tasks/syncResources', {
  'assets/fonts': 'public/fonts',
  'assets/img':   'public/img'
}));


gulp.task("client:sync-css-images-once", lazyRequireTask('./tasks/syncCssImages', {
  src: 'styles/**/*.{png,svg,gif,jpg}',
  dst: 'public/i'
}));

gulp.task('client:clean-compiled-css', function(callback) {
  fs.unlink('./public/styles/base.css', function(err) {
    if (err && err.code == 'ENOENT') return callback();
    callback(err);
  });
});

// Show errors if encountered
gulp.task('client:compile-css-once',
  ['client:clean-compiled-css'],
  lazyRequireTask('./tasks/compileCss', {
    src: './styles/base.styl',
    dst: './public/styles'
  })
);

gulp.task('client:minify', lazyRequireTask('./tasks/minify', {
  root: './public'
}));

gulp.task("client:browserify:clean", lazyRequireTask('./tasks/browserifyClean', { dst: './public/js'}));

gulp.task("client:browserify-once", ['client:browserify:clean'], lazyRequireTask('./tasks/browserify'));

// we depend on compile-css, because if build-md5-list-once works in parallel with client:compile-css,
// then compile-css recreates files and build-md5-list-once misses them or errors when they are suddenly removed
gulp.task("client:build-md5-list-once",
  lazyRequireTask('./tasks/buildMd5List', { cwd: 'public', src: './{fonts,js,styles}/**/*.*', dst: './public.md5.json' }));

gulp.task('build', function(callback) {
  runSequence('link-modules', "client:sync-resources-once", 'client:compile-css-once', 'client:browserify-once', 'client:sync-css-images-once', 'client:build-md5-list-once', callback);
});

gulp.task('dev', function(callback) {
//  runSequence('build', ["client:sync-resources", 'client:compile-css', 'client:browserify', 'client:sync-css-images', 'client:build-md5-list', 'nodemon', 'client:livereload'], callback);
  runSequence('build', ['nodemon', 'client:livereload', 'watch'], callback);
});

gulp.task('tutorial:import', ['link-modules'], lazyRequireTask('tutorial/tasks/import', {
  root:        'javascript-tutorial',
  updateFiles: true // skip same size files
}));
