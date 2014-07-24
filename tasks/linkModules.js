var fs = require('fs');
var glob = require('glob');
var path = require('path');
var gutil = require('gulp-util');

// Ensures the existance of a symlink linkDst -> linkSrc
// returns true if link was created
// returns false if link exists alread (and is correct)
// throws error if conflict (another file or link by that name)
function ensureSymlinkSync(linkSrc, linkDst) {
  var lstat;
  try {
    lstat = fs.lstatSync(linkDst);
  } catch (e) {
  }

  if (lstat) {
    if (!lstat.isSymbolicLink()) {
      throw new Error("Conflict: path exist and is not a link: " + linkDst);
    }

    var oldDst = fs.readlinkSync(linkDst);
    if (oldDst == linkSrc) {
      return false; // already exists
    }
    // kill old link!
    fs.unlinkSync(linkDst);
  }

  fs.symlinkSync(linkSrc, linkDst);
  return true;
}

module.exports = function(sources) {

  return function() {
    var modules = [];
    sources.forEach(function(pattern) {
      modules = modules.concat(glob.sync(pattern));
    });

    for (var i = 0; i < modules.length; i++) {
      var moduleToLinkRelPath = modules[i];  // hmvc/auth
      var moduleToLinkName = path.basename(moduleToLinkRelPath); // auth
      var linkSrc = path.join('..', moduleToLinkRelPath);
      var linkDst = path.join('node_modules', moduleToLinkName);
      if (ensureSymlinkSync(linkSrc, linkDst)) {
        gutil.log(linkSrc + " -> " + linkDst);
      }
    }
  };

};
