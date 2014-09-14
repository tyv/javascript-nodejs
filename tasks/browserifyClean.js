const fse = require('fs-extra');

module.exports = function(options) {

  return function(callback) {
    fse.removeSync(options.dst);
    fse.mkdirsSync(options.dst);
    callback();
  };
};

