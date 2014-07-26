var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('config/mongoose');

module.exports = function(dbPath) {

  return function(callback) {

    gutil.log("loading db " + dbPath);

    co(function*() {

      yield* dataUtil.loadDb(dbPath);

      gutil.log("loaded db " + dbPath);
    })(function(err) {
      if (err) throw err;
      mongoose.disconnect();
      callback();
    });

  };

};
