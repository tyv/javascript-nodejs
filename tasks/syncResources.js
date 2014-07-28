const fse = require('fs-extra');
const gp = require('gulp-load-plugins')();

module.exports = function(resources) {

  return function(callback) {

    for (var src in resources) {
      var dst = resources[src];

      fse.removeSync(src);

      if (process.env.NODE_ENV == 'development') {
        fse.mkdirsSync(dst);
        gp.dirSync(src, dst);
      } else {
        fse.copySync(src, dst);
      }
    }

    if (process.env.NODE_ENV != 'development') callback();
  };
};
