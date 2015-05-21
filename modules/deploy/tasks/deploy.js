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
    .example('gulp deploy --host nightly')
    .example('gulp deploy --host nightly --ref aaabbbccc')
    .demand(['host'])
    .argv;

  return function() {

    return co(function*() {

      var client = yield* sshConnect(args.host);

      var execRemote = function(cmd, options) {
        gutil.log(cmd);
        return sshExec(client, cmd, options);
      };


      yield* execRemote(`cd ${config.deploy.buildPath}; git reset --hard`);
      yield* execRemote(`cd ${config.deploy.buildPath}; git fetch origin master`);
      yield* execRemote(`cd ${config.deploy.buildPath}; git merge origin/master --no-edit`);

      yield* execRemote(`cd ${config.deploy.buildPath}; gulp build`, {
        env: {
          NODE_ENV: 'production',
          ASSET_VERSIONING: 'file'
        }
      });


      // now do the build!

      client.end();

    });

  };
};

