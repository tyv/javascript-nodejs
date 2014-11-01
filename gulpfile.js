/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

// new Set([1,2]).size = 0 in node 0.11.14, Set is buggy all around
// this header prevents `array-uniq` (-> array-union -> multimatch -> gulp-load-plugins) from it's use
// fixme: when those above are fixed, remove it
delete Set.prototype.forEach;

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const runSequence = require('run-sequence');

// before anything: make sure all modules are linked
gulp.task('link-modules', lazyRequireTask('./tasks/linkModules', { src: ['client', 'modules/*', 'hmvc/*'] }));
// sync!
gulp.start('link-modules');

const config = require('config');
const mongoose = require('lib/mongoose');

//Error.stackTraceLimit = Infinity;
//require('trace');
//require('clarify');

process.on('uncaughtException', function(err) {
  console.log(err.message, err.stack);
  process.exit(255);
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
  ext:    "js,jade",
 // restartable: false, // don't hook on STDIN to wait rs
  nodeArgs: ['--debug', '--harmony'],
  script: "./bin/server",
  ignore: '**/client/', // ignore hmvc apps client code
  watch:  ["hmvc", "modules"]
}));

gulp.task("client:livereload", lazyRequireTask("./tasks/livereload", {
  // watch files *.*, not directories, no need to reload for new/removed files,
  // we're only interested in changes
  watch: "public/{i,img,js,styles}/**/*.*"
}));

gulp.task("tutorial:import:watch", lazyRequireTask('tutorial/tasks/importWatch', {
  root: "/js/javascript-nodejs/javascript-tutorial"
}));

gulp.task('watch', lazyRequireTask('./tasks/watch', {
  root:        __dirname,
  taskMapping: [
    {
      watch: 'assets/**',
      task:  'client:sync-resources'
    },
    {
      watch: 'styles/**/*.{png,svg,gif,jpg}',
      task:  'client:sync-css-images'
    },
    {
      watch: "styles/**/*.styl",
      task:  'client:compile-css'
    }
  ]
}));

gulp.task("client:sync-resources", lazyRequireTask('./tasks/syncResources', {
  assets: 'public'
}));


gulp.task("client:sync-css-images", lazyRequireTask('./tasks/syncCssImages', {
  src: 'styles/**/*.{png,svg,gif,jpg}',
  dst: 'public/i'
}));

// Show errors if encountered
gulp.task('client:compile-css',
  lazyRequireTask('./tasks/compileCss', {
    src: './styles/base.styl',
    dst: './public/styles',
    publicDst: config.staticHost + '/styles/',  // from browser point of view
    manifest: path.join(config.manifestRoot, 'styles.versions.json')
  })
);

gulp.task('plunk:sync', lazyRequireTask('./tasks/plunkSync', {
  root: "/js/javascript-nodejs/javascript-tutorial"
}));

gulp.task('client:minify', lazyRequireTask('./tasks/minify', {
  root: './public'
}));

gulp.task('client:webpack', lazyRequireTask('./tasks/webpack'));

gulp.task('build', function(callback) {
  runSequence("client:sync-resources", 'client:compile-css', 'client:sync-css-images', 'client:webpack', callback);
});

gulp.task('edit', ['dev', 'tutorial:import:watch']);

gulp.task('dev', function(callback) {
  runSequence("client:sync-resources", 'client:compile-css', 'client:sync-css-images', ['nodemon', 'client:livereload', 'client:webpack', 'watch'], callback);
});

gulp.task('tutorial:import', ['cache:clean'], lazyRequireTask('tutorial/tasks/import', {
  root:        'javascript-tutorial',
  updateFiles: true // skip same size files
}));

gulp.task('cache:clean', lazyRequireTask('./tasks/cacheClean'));

gulp.task('check:spider', lazyRequireTask('./tasks/checkSpider'));

// when queue finished successfully or aborted, close db
// orchestrator events (sic!)
gulp.on('stop', function() {
  mongoose.disconnect();
});

gulp.on('err', function() {
  mongoose.disconnect();
});


