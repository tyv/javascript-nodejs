
// Pull all changes from the master branch and build the artifact
// Then commit to production branch
//
// rm -rf node_modules to reinstall them


const gulp = require('gulp');
const gutil = require('gulp-util');
const execSync = require('child_process').execSync;

function exec(cmd, options) {
  options = options || {};
  gutil.log(cmd);
  if (!options.stdio) options.stdio = 'inherit';
  execSync(cmd, options);
}

module.exports = function() {

  return function(callback) {
    execSync('git pull origin master');
    // rebuild the artifact and add prod. files to the branch
    execSync('gulp build', { // exec gulp inside of gulp ;) simpler than build up task deps
      env: {ASSET_VERSIONING: 'file'}
    });
    execSync('git add --force public manifest');

    // if there's nothing to commit,
    // `git commit` would exit with status 1, stopping the deploy
    // so I commit only if there are changes
    var changes = execSync('git diff-index --quiet HEAD');
    console.log(changes);
    process.exit(1);
  };

};


/*

( || git commit -a -m deploy) &&
git push origin production

*/
