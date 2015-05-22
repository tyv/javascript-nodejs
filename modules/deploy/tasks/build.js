var co = require('co');
var readHostFromSSHConfig = require('../lib/readHostFromSSHConfig');
var sshConnect = require('../lib/sshConnect');
var sshExec = require('../lib/sshExec');
var config = require('config');
var gutil = require('gulp-util');

/**
 * Update prod build dir from master, rebuild and commit to prod
 * @returns {Function}
 */
module.exports = function() {

  var args = require('yargs')
    .example('gulp deploy:build --host nightly')
    .example('gulp deploy:build --host nightly --with-npm')
    .demand(['host'])
    .argv;

  return function() {

    return co(function*() {

      var client = yield* sshConnect(args.host);

      try {
        yield* client.runInBuild(`git reset --hard`);
        yield* client.runInBuild(`git fetch origin master`);
        yield* client.runInBuild(`git merge origin/master --no-edit`);

        if (args.withNpm) {
          yield* reinstallModules();
        }

        if (!args.onlyCode) {
          yield* client.runInBuild(`NODE_ENV=production ASSET_VERSIONING=file gulp build`);
          yield* client.runInBuild('git add --force public manifest');
        }

        // if there's nothing to commit,
        // `git commit` would exit with status 1, stopping the deploy
        // so I commit only if there are changes
        try {
          yield* client.runInBuild('git diff-index --quiet HEAD');
        } catch(e) {
          if (e.code == 1) {
            // exit code 1 means that there's something to commit
            yield* client.runInBuild('git commit -a -m deploy');
          }
        }

        yield* client.runInBuild('git push origin production');
      } finally {
        client.end();
      }

      function* reinstallModules() {
        yield* client.runInBuild(`rm -rf node_modules`);
        yield* client.runInBuild(`npm install --no-spin --node-gyp=pangyp`);
        yield* client.runInBuild('git add --force node_modules');
      }

    });

  };
};

