/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
*/

const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const path = require('path');
//const browserifyTask = require('tasks/browserify');

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

//gulp.task('lint', require('./tasks/lint-full-die')(serverSources));


gulp.task('watch', ['stylus'], function(neverCalled) {
  /*
   browserifyTask({
   src: 'app/js/index.js',
   dst: 'www/js'
   })();
   */
  const fse = require('fs-extra');

  fse.ensureDirSync('www/fonts');
  gp.dirSync('app/fonts', 'www/fonts');

  fse.ensureDirSync('www/img');
  gp.dirSync('app/img', 'www/img');

  fse.ensureDirSync('www/js');
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
