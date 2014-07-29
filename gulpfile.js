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

function lazyRequireTask(name) {
  var args = [].slice.call(arguments, 1);

  return function(callback) {
    var task = require('./tasks/' + name).apply(this, args);

    return task(callback);
  };
}

gulp.task('lint-once', lazyRequireTask('lintOnce', { src: serverSources }));

gulp.task('lint-or-die', lazyRequireTask('lintOnce', { src: serverSources, dieOnError: true }));

gulp.task('lint', ['lint-once'], lazyRequireTask('lint', {src: serverSources}));

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', lazyRequireTask('loadDb'));

gulp.task("supervisor", ['link-modules'], lazyRequireTask('supervisor', { cmd: "./bin/www", watch: ["hmvc", "modules"] }));

gulp.task("app:livereload", lazyRequireTask("livereload", { watch: "www/**/*.*" }));

gulp.task('link-modules', lazyRequireTask('linkModules', { src: ['modules/*', 'hmvc/*'] }));


gulp.task("app:sync-resources", lazyRequireTask('syncResources', {
  'app/fonts' : 'www/fonts',
  'app/img': 'www/img'
}));

gulp.task("app:sync-stylesheet-images", lazyRequireTask('syncStylesheetImages', {
  'app/fonts' : 'www/fonts',
  'app/img': 'www/img'
}));

gulp.task('app:sprite-once', lazyRequireTask('spriteOnce', {
  spritesSearchFsRoot: 'app',
  spritesWebRoot:      '/sprites',
  spritesFsDir:        'www/sprites',
  styleFsDir:          'app/stylesheets/sprites'
}));

gulp.task('app:sprite', ['app:sprite-once'], lazyRequireTask('sprite', { watch: "app/**/*.sprite/**"}));

gulp.task('app:clean-compiled-css', function(callback) {
  fs.unlink('./www/stylesheets/base.css', function(err) {
    if (err && err.code == 'ENOENT') err = null;
    callback(err);
  });
});

// Show errors if encountered
gulp.task('app:compile-css-once',
  ['app:clean-compiled-css'],
  lazyRequireTask('compileCssOnce', {
    src: './app/stylesheets/base.styl',
    dst: './www/stylesheets'
  })
);



gulp.task('app:compile-css', ['app:compile-css-once'], lazyRequireTask('compileCss', { watch: "app/**/*.styl"}));


gulp.task("app:browserify:clean", lazyRequireTask('browserifyClean', { dst: './www/js'} ));


gulp.task("app:browserify", ['app:browserify:clean'], lazyRequireTask('browserify'));


// compile-css and sprites are independant tasks
// run both or run *-once separately
gulp.task('run', ['supervisor', 'app:livereload', "app:sync-resources", 'app:compile-css', 'app:sprite', 'app:browserify']);


// TODO: refactor me out!
gulp.task('import', function(callback) {
  const mongoose = require('config/mongoose');
  const taskImport = require('tutorial/tasks/import');

  taskImport({
    root:        path.join(path.dirname(__dirname), 'javascript-tutorial'),
    updateFiles: true // skip same size files
    //minify: true // takes time(!)
  })(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});
