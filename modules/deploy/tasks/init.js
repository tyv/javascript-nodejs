var co = require('co');
var sshConnect = require('../lib/sshConnect');
var sshExec = require('../lib/sshExec');
var config = require('config');
var gutil = require('gulp-util');

// path/build must be initialized with:
// git clone -b production --single-branch git://sub.domain.com/repo.git
module.exports = function() {

  var args = require('yargs')
    .demand(['host'])
    .argv;

  return function() {

    return co(function*() {

      var client = yield* sshConnect(args.host);

      yield* client.run(`rm -rf ${config.deploy.buildPath}`);
      yield* client.run(`rm -rf ${config.deploy.targetPath}`);

      // must make big --depth N, because `gut pull origin/master` may fail to auto-merge if depth is too small
      // for safety not using --depth at all
      // not using --single-branch, cause need master too
      yield* client.run(`git clone ${config.deploy.repo} ${config.deploy.buildPath}`);
      // now master & production branches are created,
      // using production for the build
      yield* client.runInBuild(`git checkout production`);
      //yield* client.runInBuild(`npm install`);

      yield* client.run(`mkdir -p ${config.deploy.targetPath}`);
      yield* client.run(`cp -a ${config.deploy.buildPath} ${config.deploy.targetPath}`);

      client.end();

    });

  };
};

