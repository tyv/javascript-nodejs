var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var gutil = require('gulp-util');

function ensureSymlinkSync(linkSrc, linkDst) {
  var lstat;
  try {
    lstat = fs.lstatSync(linkDst);
  } catch (e) {
  }

  if (lstat) {
    if (lstat.isSymbolicLink()) {
      fs.unlinkSync(linkDst);
    } else {
      throw new Error("Conflict: path exist and is not a link: " + linkDst);
    }
  }

  fs.symlinkSync(linkSrc, linkDst);

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
      gutil.log(linkSrc + " -> " + linkDst);
      ensureSymlinkSync(linkSrc, linkDst);
    }
  };

};
