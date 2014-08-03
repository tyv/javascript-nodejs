/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const development = (process.env.NODE_ENV == 'development');

const serverSources = [
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
    if (process.env.NODE_ENV == 'development') {
      gulp.watch(watch, [task]);
    } else {
      callback();
    }
  };
}

gulp.task('lint-once', lazyRequireTask('./tasks/lint', { src: serverSources }));

gulp.task('lint-or-die', lazyRequireTask('./tasks/lint', { src: serverSources, dieOnError: true }));

gulp.task('lint', ['lint-once'], wrapWatch(serverSources, 'lint'));

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', lazyRequireTask('./tasks/loadDb'));

gulp.task("supervisor", ['link-modules'], lazyRequireTask('./tasks/supervisor', { cmd: "./bin/www", watch: ["hmvc", "modules"] }));

gulp.task("app:livereload", lazyRequireTask("./tasks/livereload", { watch: "www/**/*.*" }));

gulp.task('link-modules', lazyRequireTask('./tasks/linkModules', { src: ['modules/*', 'hmvc/*'] }));


gulp.task("app:sync-resources", lazyRequireTask('./tasks/syncResources', {
  'app/fonts': 'www/fonts',
  'app/img':   'www/img'
}));

gulp.task("app:sync-css-images-once", lazyRequireTask('./tasks/syncCssImages', {
  src: 'app/stylesheets/**/*.{png,svg,gif,jpg}',
  dst: 'www/i'
}));

gulp.task('app:sync-css-images', ['app:sync-css-images-once'],
  wrapWatch('app/stylesheets/**/*.{png,svg,gif,jpg}', 'app:sync-css-images-once')
);


gulp.task('app:sprite-once', lazyRequireTask('./tasks/sprite', {
  spritesSearchFsRoot: 'app',
  spritesWebRoot:      '/i',
  spritesFsDir:        'www/i',
  styleFsDir:          'app/stylesheets/sprites'
}));

gulp.task('app:sprite', ['app:sprite-once'], wrapWatch("app/**/*.sprite/**", 'sprite'));

gulp.task('app:clean-compiled-css', function(callback) {
  fs.unlink('./www/stylesheets/base.css', function(err) {
    if (err && err.code == 'ENOENT') err = null;
    callback(err);
  });
});

// Show errors if encountered
gulp.task('app:compile-css-once',
  ['app:clean-compiled-css'],
  lazyRequireTask('./tasks/compileCss', {
    src: './app/stylesheets/base.styl',
    dst: './www/stylesheets'
  })
);

gulp.task('app:minify', lazyRequireTask('./tasks/minify', {
  root: './www'
}));


gulp.task('app:compile-css', ['app:compile-css-once'], wrapWatch("app/**/*.styl", "app:compile-css-once"));


gulp.task("app:browserify:clean", lazyRequireTask('./tasks/browserifyClean', { dst: './www/js'}));


gulp.task("app:browserify", ['app:browserify:clean'], lazyRequireTask('./tasks/browserify'));


// compile-css and sprites are independant tasks
// run both or run *-once separately
gulp.task('run', ['supervisor', 'app:livereload', "app:sync-resources", 'app:compile-css', 'app:sprite', 'app:browserify', 'app:sync-css-images']);

gulp.task('tutorial:import', lazyRequireTask('tutorial/tasks/import', {
  root:        path.join(process.cwd(), 'javascript-tutorial'),
  updateFiles: true // skip same size files
}));
