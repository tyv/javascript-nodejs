var co = require('co');
var sshConnect = require('../lib/sshConnect');
var sshExec = require('../lib/sshExec');
var config = require('config');
var gutil = require('gulp-util');

/**
 * Init build & working copy.
 * Deletes and recreates everything.
 * @returns {Function}
 */
module.exports = function() {

  var args = require('yargs')
    .demand(['host'])
    .argv;

  return function() {

    return co(function*() {

      var client = yield* sshConnect(args.host);

      try {
        yield* client.run(`rm -rf ${config.deploy.buildPath}`);

        // must make big --depth N, because `gut pull origin/master` may fail to auto-merge if depth is too small
        // for safety not using --depth at all
        // not using --single-branch, cause need master too
        yield* client.run(`git clone ${config.deploy.repo} ${config.deploy.buildPath}`);
        // now master & production branches are created,
        // using production for the build
        yield* client.runInBuild(`git checkout production`);
        //yield* client.runInBuild(`npm install`);

        yield* client.run(`rm -rf ${config.deploy.targetPath}`);

        // create path to target dir
        yield* client.run(`mkdir -p ${config.deploy.targetPath}`);

        // remove the target dir itself (will be copied)
        yield* client.run(`rmdir ${config.deploy.targetPath}`);

        yield* client.run(`cp -a ${config.deploy.buildPath} ${config.deploy.targetPath}`);
      } finally {
        client.end();
      }

    });

  };
};

