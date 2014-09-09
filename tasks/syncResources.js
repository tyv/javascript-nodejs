const fs = require('fs');
const fse = require('fs-extra');
const gp = require('gulp-load-plugins')();
const glob = require('glob');
const path = require('path');

module.exports = function(resources) {

  return function(callback) {

    for (var src in resources) {
      var dst = resources[src];

      var files = glob.sync(src + '/**');
      for (var i = 0; i < files.length; i++) {
        var srcPath = files[i];

//        console.log(srcPath);
        var dstPath = srcPath.replace(src, dst);

        var srcStat = fs.statSync(srcPath);

        if (srcStat.isDirectory()) {
          fse.ensureDirSync(dstPath);
          continue;
        }

        var dstMtime = 0;
        try {
          dstMtime = fs.statSync(dstPath).mtime;
        } catch(e) {}

        if (srcStat.mtime > dstMtime) {
          fse.copySync(srcPath, dstPath);
        }

      }
    }

    callback();

  };
};
