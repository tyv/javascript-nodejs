/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const runSequence = require('run-sequence');

//Error.stackTraceLimit = Infinity;
//require('trace');
//require('clarify');

process.on('uncaughtException', function(err) {
  // not bunyan, because the 'log' module may be not linked yet
  console.log(err);
  process.exit(255);
});

process.on('SIGINT', function() {
  process.exit(1);
});

gulp.executing = [];

gulp.on('task_start', function(msg) {
  gulp.executing.push(msg.task);
});

gulp.on('task_stop', function(msg) {
  gulp.executing.splice(gulp.executing.indexOf(msg.task), 1);
  gulp.hasOnce = gulp.executing.filter(function(name) {
    return name.match(/-once$/);
  }).length > 0;
  console.log(gulp.executing, gulp.hasOnce);
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

function wrapWatch(watch, task) {
  return function(callback) {
    if (process.env.WATCH) {
      gulp.watch(watch, function(cb) {
        if (gulp.hasOnce) {
          var wait = function() {
            if (gulp.hasOnce) return;
            gulp.removeListener('task_stop', wait);
            gulp.start(task);
          };
          gulp.on('task_stop', wait);
        } else {
          gulp.start(task);
        }
      });
    } else {
      callback(); // @see usage examples, wrapWatch only triggers watch, should depend on ['task']
      // gulp.start(task, callback);
    }
  };
}

gulp.task('lint-once', lazyRequireTask('./tasks/lint', { src: jsSources }));

gulp.task('lint-or-die', lazyRequireTask('./tasks/lint', { src: jsSources, dieOnError: true }));

gulp.task('lint', ['lint-once'], wrapWatch(jsSources, 'lint'));

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', lazyRequireTask('./tasks/loadDb'));

gulp.task("nodemon", lazyRequireTask('./tasks/nodemon', {
  script: "./bin/server",
  ignore: '**/client/', // ignore hmvc apps client code
  watch:  ["hmvc", "modules"]
}));

gulp.task("client:livereload", lazyRequireTask("./tasks/livereload", { watch: "public/{i,img,js,styles}/*.*" }));

gulp.task('link-modules', lazyRequireTask('./tasks/linkModules', { src: ['client', 'modules/*', 'hmvc/*'] }));

gulp.task("client:sync-resources", lazyRequireTask('./tasks/syncResources', {
  'assets/fonts': 'public/fonts',
  'assets/img':   'public/img'
}));

gulp.task("client:sync-css-images-once", lazyRequireTask('./tasks/syncCssImages', {
  src: 'styles/**/*.{png,svg,gif,jpg}',
  dst: 'public/i'
}));

gulp.task('client:sync-css-images', ['client:sync-css-images-once'],
  wrapWatch('styles/**/*.{png,svg,gif,jpg}', 'client:sync-css-images-once')
);

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


gulp.task('client:compile-css', ['client:compile-css-once'], wrapWatch(["styles/**/*.styl"], "client:compile-css-once"));


gulp.task("client:browserify:clean", lazyRequireTask('./tasks/browserifyClean', { dst: './public/js'}));

gulp.task("client:browserify-once", ['link-modules', 'client:browserify:clean'], lazyRequireTask('./tasks/browserify'));
gulp.task("client:browserify", ['client:browserify-once'], wrapWatch(['client/**', 'hmvc/**/client/**'], "client:browserify-once"));

// we depend on compile-css, because if build-md5-list-once works in parallel with client:compile-css,
// then compile-css recreates files and build-md5-list-once misses them or errors when they are suddenly removed
gulp.task("client:build-md5-list-once",
  lazyRequireTask('./tasks/buildMd5List', { cwd: 'public', src: './{fonts,js,styles}/**/*.*', dst: './public.md5.json' }));

gulp.task("client:build-md5-list", ['client:build-md5-list-once'],
  wrapWatch(['public/**'], 'client:build-md5-list-once')); // watch dirs only, not just files (to see new files)


gulp.task('build', function(callback) {
  runSequence('link-modules', "client:sync-resources", 'client:compile-css', 'client:browserify', 'client:sync-css-images', 'client:build-md5-list', callback);
});

gulp.task('dev', ['nodemon', 'client:livereload', 'build']);

gulp.task('tutorial:import', ['link-modules'], lazyRequireTask('tutorial/tasks/import', {
  root:        'javascript-tutorial',
  updateFiles: true // skip same size files
}));
