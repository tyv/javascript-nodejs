/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const config = require('config');
const development = (process.env.NODE_ENV == 'development');

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
    if (process.env.NODE_ENV == 'development') {
      gulp.watch(watch, [task]);
    } else {
      callback();
    }
  };
}

gulp.task('lint-once', lazyRequireTask('./tasks/lint', { src: jsSources }));

gulp.task('lint-or-die', lazyRequireTask('./tasks/lint', { src: jsSources, dieOnError: true }));

gulp.task('lint', ['lint-once'], wrapWatch(jsSources, 'lint'));

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', lazyRequireTask('./tasks/loadDb'));

gulp.task("supervisor", ['link-modules'], lazyRequireTask('./tasks/supervisor', { cmd: "./bin/server", watch: ["hmvc", "modules"] }));

gulp.task("frontend:livereload", lazyRequireTask("./tasks/livereload", { watch: "public/**/*.*" }));

gulp.task('link-modules', lazyRequireTask('./tasks/linkModules', { src: ['frontend', 'modules/*', 'hmvc/*'] }));

gulp.task("frontend:sync-resources", lazyRequireTask('./tasks/syncResources', {
  'assets/fonts': 'public/fonts',
  'assets/img':   'public/img'
}));

gulp.task("frontend:sync-css-images-once", lazyRequireTask('./tasks/syncCssImages', {
  src: 'styles/**/*.{png,svg,gif,jpg}',
  dst: 'public/i'
}));

gulp.task('frontend:sync-css-images', ['frontend:sync-css-images-once'],
  wrapWatch('styles/**/*.{png,svg,gif,jpg}', 'frontend:sync-css-images-once')
);


gulp.task('frontend:sprite-once', lazyRequireTask('./tasks/sprite', {
  spritesSearchFsRoot: 'frontend',
  spritesWebRoot:      '/i',
  spritesFsDir:        'public/i',
  styleFsDir:          'styles/sprites'
}));

//gulp.task('frontend:sprite', ['frontend:sprite-once'], wrapWatch("frontend/**/*.sprite/**", 'sprite'));

gulp.task('frontend:clean-compiled-css', function(callback) {
  fs.unlink('./public/styles/base.css', function(err) {
    if (err && err.code == 'ENOENT') err = null;
    callback(err);
  });
});

// Show errors if encountered
gulp.task('frontend:compile-css-once',
  // need sprite here, because it generates sprite.styl required by other .styl's
  ['frontend:clean-compiled-css', 'frontend:sprite-once'],
  lazyRequireTask('./tasks/compileCss', {
    src: './styles/base.styl',
    dst: './public/styles'
  })
);

gulp.task('frontend:minify', lazyRequireTask('./tasks/minify', {
  root: './public'
}));


gulp.task('frontend:compile-css', ['frontend:compile-css-once'], wrapWatch(["styles/**/*.styl","styles/**/*.sprite/**"], "frontend:compile-css-once"));


gulp.task("frontend:browserify:clean", lazyRequireTask('./tasks/browserifyClean', { dst: './public/js'}));


gulp.task("frontend:browserify", ['frontend:browserify:clean'], lazyRequireTask('./tasks/browserify'));


// compile-css and sprites are independant tasks
// run both or run *-once separately
gulp.task('run', [
  'supervisor', 'frontend:livereload',
  "frontend:sync-resources", 'frontend:compile-css', 'frontend:browserify', 'frontend:sync-css-images']);

gulp.task('tutorial:import', lazyRequireTask('tutorial/tasks/import', {
  root:        path.join(config.projectRoot, 'javascript-tutorial'),
  updateFiles: true // skip same size files
}));
