/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const runSequence = require('run-sequence');

const linkModules = require('./modules/linkModules');

linkModules({
  src: ['client', 'styles', 'modules/*', 'handlers/*', 'extra/handlers/*']
});

require('cls'); // init CLS namespace once

const config = require('config');
const mongoose = require('lib/mongoose');

process.on('uncaughtException', function(err) {
  console.error(err.message, err.stack, err.errors);
  process.exit(255);
});

const jsSources = [
  'handlers/**/*.js', 'modules/**/*.js', 'tasks/**/*.js', '*.js'
];

function lazyRequireTask(path) {
  var args = [].slice.call(arguments, 1);
  return function(callback) {
    var task = require(path).apply(this, args);

    return task(callback);
  };
}

/* the task does nothing, used to run linkModules only */
gulp.task('init');

gulp.task('lint-once', lazyRequireTask('./tasks/lint', { src: jsSources }));
gulp.task('lint-or-die', lazyRequireTask('./tasks/lint', { src: jsSources, dieOnError: true }));

// usage: gulp db:load --from fixture/init --harmony
gulp.task('db:load', lazyRequireTask('./tasks/dbLoad'));
gulp.task('db:clear', lazyRequireTask('./tasks/dbClear'));
gulp.task('migrate:play', lazyRequireTask('./tasks/migratePlay'));

gulp.task('migrate:up', lazyRequireTask('migrate/tasks/up'));
gulp.task('migrate:down', lazyRequireTask('migrate/tasks/down'));
gulp.task('migrate:create', lazyRequireTask('migrate/tasks/create'));

gulp.task('courses:material:add', lazyRequireTask('courses/tasks/materialAdd'));
gulp.task('courses:group:send', lazyRequireTask('courses/tasks/groupSend'));

gulp.task("nodemon", lazyRequireTask('./tasks/nodemon', {
  // shared client/server code has require('template.jade) which precompiles template on run
  // so I have to restart server to pickup the template change
  ext:    "js,jade",

  nodeArgs: ['--debug', '--harmony_classes'],
  script: "./bin/server",
  ignore: '**/client/', // ignore handlers' client code
  watch:  ["handlers", "modules"]
}));

gulp.task("client:livereload", lazyRequireTask("./tasks/livereload", {
  // watch files *.*, not directories, no need to reload for new/removed files,
  // we're only interested in changes

  watch: [
    "public/pack/**/*.*",
    // not using this file, using only styles.css (extracttextplugin)
    "!public/pack/styles.js",
    // this file changes every time we update styles
    // don't watch it, so that the page won't reload fully on style change
    "!public/pack/head.js"
  ]
}));

gulp.task("tutorial:import:watch", lazyRequireTask('tutorial/tasks/importWatch', {
  root: process.env.TUTORIAL_ROOT
}));

gulp.task("tutorial:beautify", lazyRequireTask('tutorial/tasks/beautify', {
  root: process.env.TUTORIAL_ROOT
}));

gulp.task("tutorial:edit", lazyRequireTask('tutorial/tasks/edit'));

gulp.task("payments:order:paid", lazyRequireTask('payments/tasks/orderPaid'));
gulp.task("payments:order:cancelPending", lazyRequireTask('payments/tasks/orderCancelPending'));

gulp.task("newsletter:send", lazyRequireTask('newsletter/tasks/send'));
gulp.task("newsletter:createLetters", lazyRequireTask('newsletter/tasks/createLetters'));

var testSrcs = ['{handlers,modules}/**/test/**/*.js'];
// on Travis, keys are required for E2E Selenium tests
// for PRs there are no keys, so we disable E2E
if (!process.env.TEST_E2E || process.env.CI && process.env.TRAVIS_SECURE_ENV_VARS=="false") {
  testSrcs.push('!{handlers,modules}/**/test/e2e/*.js');
}

gulp.task("test", lazyRequireTask('./tasks/test', {
  src: testSrcs,
  reporter: 'spec',
  timeout: 100000 // big timeout for webdriver e2e tests
}));


gulp.task('watch', lazyRequireTask('./tasks/watch', {
  root:        __dirname,
  // for performance, watch only these dirs under root
  dirs: ['assets', 'styles'],
  taskMapping: [
    {
      watch: 'assets/**',
      task:  'client:sync-resources'
    }
  ]
}));

// init deploy (kill all and recreate)
gulp.task('deploy:init', lazyRequireTask('deploy/tasks/init'));

// build on remote
gulp.task('deploy:build', lazyRequireTask('deploy/tasks/build'));

// apply db migrations
gulp.task('deploy:migrate', lazyRequireTask('deploy/tasks/migrate'));

// update remote working site & repo
gulp.task('deploy:update', lazyRequireTask('deploy/tasks/update'));

gulp.task('deploy', function(callback) {
  runSequence("deploy:build", "deploy:update", callback);
});

gulp.task("client:sync-resources", lazyRequireTask('./tasks/syncResources', {
  assets: 'public'
}));

gulp.task("videoKey:load", lazyRequireTask('videoKey/tasks/load'));

// Show errors if encountered
gulp.task('client:compile-css',
  lazyRequireTask('./tasks/compileCss', {
    src: './styles/base.styl',
    dst: './public/styles',
    publicDst: process.env.STATIC_HOST + '/styles/',  // from browser point of view
    manifest: path.join(config.manifestRoot, 'styles.versions.json'),
    assetVersioning: config.assetVersioning
  })
);


gulp.task('client:minify', lazyRequireTask('./tasks/minify'));
gulp.task('client:resize-retina-images', lazyRequireTask('./tasks/resizeRetinaImages'));

gulp.task('client:webpack', lazyRequireTask('./tasks/webpack'));
//gulp.task('client:webpack-dev-server', lazyRequireTask('./tasks/webpackDevServer'));


gulp.task('build', function(callback) {
  runSequence("client:sync-resources", 'client:webpack', callback);
});

gulp.task('server', lazyRequireTask('./tasks/server'));

gulp.task('edit', ['build', 'tutorial:import:watch', "client:sync-resources", 'client:livereload', 'server']);


gulp.task('dev', function(callback) {
  runSequence("client:sync-resources", ['nodemon', 'client:livereload', 'client:webpack', 'watch'], callback);
});

gulp.task('tutorial:import', ['cache:clean'], lazyRequireTask('tutorial/tasks/tutorialImport'));

gulp.task('quiz:import', ['cache:clean'], lazyRequireTask('quiz/tasks/quizImport'));


gulp.task('tutorial:remote:update', lazyRequireTask('tutorial/tasks/remoteUpdate'));

gulp.task('figures:import', lazyRequireTask('tutorial/tasks/figuresImport'));

gulp.task('tutorial:kill:content', ['cache:clean'], lazyRequireTask('tutorial/tasks/killContent'));

gulp.task('tutorial:cache:regenerate', lazyRequireTask('tutorial/tasks/cacheRegenerate'));

gulp.task('cloudflare:clean', lazyRequireTask('./tasks/cloudflareClean', {
  domains: ['javascript.ru', 'js.cx']
}));

gulp.task('cache:clean', lazyRequireTask('./tasks/cacheClean'));

gulp.task('config:nginx', lazyRequireTask('./tasks/configNginx'));

// when queue finished successfully or aborted, close db
// orchestrator events (sic!)
gulp.on('stop', function() {
  mongoose.disconnect();
});

gulp.on('err', function(gulpErr) {
  if (gulpErr.err) {
    // cause
    console.error("Gulp error details", [gulpErr.err.message, gulpErr.err.stack, gulpErr.err.errors].filter(Boolean));
  }
  mongoose.disconnect();
});


