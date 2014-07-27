/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const serverSources = [
  'config/**/*.js', 'hmvc/**/*.js', 'modules/**/*.js', 'renderer/**/*.js', 'routes/**/*.js',
  'setup/**/*.js', 'tasks/**/*.js', '*.js'
];

gulp.task('lint', function() {
  return gp.jshintCache({ src: serverSources }).apply(this, arguments);
});

gulp.task('lint-or-die', function() {
  return gp.jshintCache({ src: serverSources, dieOnError: true }).apply(this, arguments);
});

gulp.task('lint-watch', ['lint'], function(neverCalled) {
  gulp.watch(serverSources, ['lint']);
});

// usage: gulp loaddb --db fixture/db
gulp.task('loaddb', function(callback) {
  var task = require('tasks/loadDb');

  var args = require('yargs')
    .usage("Path to DB is required.")
    .demand(['db'])
    .argv;

  var dbPath = path.join(__dirname, args.db);
  assert(fs.existsSync(dbPath));

  task(dbPath)(callback);
});


gulp.task('watchify', function(neverCalled) {

  const browserify = require('./tasks/browserify');

  browserify({
    src: './app/js/main.js',
    dst: './www/js',
    watch: true
  });

});

gulp.task('watch', ['stylus'], function(neverCalled) {
  const fse = require('fs-extra');

  fse.removeSync(['www/fonts']);
  fse.removeSync(['www/img']);
  fse.removeSync(['www/js']);

  fse.mkdirsSync('www/fonts');
  fse.mkdirsSync('www/img');
  fse.mkdirsSync('www/js');

  gp.dirSync('app/fonts', 'www/fonts');
  gp.dirSync('app/img', 'www/img');
  gp.dirSync('app/js', 'www/js');

  gulp.watch("app/**/*.sprites/**", ['sprite']);
  gulp.watch("app/**/*.styl", ['stylus']);

  gulp.watch(serverSources, ['link-modules']);
});

// Show errors if encountered
gulp.task('stylus', ['clean-compiled-css', 'sprite'], function() {
  return gulp.src('./app/stylesheets/base.styl')
    // without plumber if stylus emits PluginError, it will disappear at the next step
    // plumber propagates it down the chain
    .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
    .pipe(gp.stylus({use: [require('nib')()]}))
    .pipe(gp.autoprefixer("last 1 version"))
    .pipe(gulp.dest('./www/stylesheets'))
    .pipe(gp.livereload());
});

gulp.task('clean-compiled-css', function() {
  return gulp.src('./www/stylesheets/base.css').pipe(gp.rimraf());
});


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

gulp.task('link-modules', function() {
  const linkModules = require('./tasks/linkModules');

  return linkModules(['modules/*', 'hmvc/*']).apply(this, arguments);
});



gulp.task('sprite', function() {
  var options = {
    spritesSearchFsRoot: 'app',
    spritesWebRoot:      '/img',
    spritesFsDir:        'www/img',
    styleFsDir:          'app/stylesheets/sprites'
  };

  return gp.stylusSprite(options).apply(this, arguments);
});
