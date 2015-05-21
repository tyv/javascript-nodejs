var co = require('co');
var readHostFromSSHConfig = require('../lib/readHostFromSSHConfig');
var sshConnect = require('../lib/sshConnect');
var sshExec = require('../lib/sshExec');
var config = require('config');
var gutil = require('gulp-util');

// path/build must be initialized with:
// git clone -b production --single-branch git://sub.domain.com/repo.git
module.exports = function() {

  var args = require('yargs')
    .example('gulp deploy:build --host nightly')
    .example('gulp deploy:build --host nightly --npm')
    .demand(['host'])
    .argv;

  return function() {

    return co(function*() {

      var client = yield* sshConnect(args.host);

      yield* client.runInBuild(`git reset --hard`);
      yield* client.runInBuild(`git fetch origin master`);
      yield* client.runInBuild(`git merge origin/master --no-edit`);

      if (args.npm) {
        yield* reinstallModules();
      }

      yield* client.runInBuild(`NODE_ENV=production ASSET_VERSIONING=file gulp build`);
      yield* client.runInBuild('git add --force public manifest');

      // if there's nothing to commit,
      // `git commit` would exit with status 1, stopping the deploy
      // so I commit only if there are changes
      yield* client.runInBuild('git diff-index --quiet HEAD && git commit -a -m deploy || exit 0');

      yield* client.runInBuild('git push origin production');

      client.end();


      function* reinstallModules() {
        yield* client.runInBuild(`rm -rf node_modules`);
        yield* client.runInBuild(`npm install`);
        yield* client.runInBuild('git add --force node_modules');
      }

    });

  };
};

