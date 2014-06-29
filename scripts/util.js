var path = require('path');
var execSync = require('child_process').execSync;


// use git rev-parse to find the .git directory
function findGitRoot() {
  return execSync('git rev-parse --show-toplevel');
}

// traverse from this module's directory upwards until you find
// the project root, which is the first directory whose parent is
// *not* named node_modules
function findProjectRoot(base) {
  base = base || __dirname;
  var dir = path.resolve(base, '..');

  if (path.basename(dir) !== 'node_modules') {
    return dir;
  }

  return findProjectRoot(dir);
}

function findPackageJson() {
  return path.join(findProjectRoot(), 'package.json');
}


exports.findGitRoot = findGitRoot;
exports.findProjectRoot = findProjectRoot;
exports.findPackageJson = findPackageJson;