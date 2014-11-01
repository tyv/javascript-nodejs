var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;

module.exports = function() {
  return function(callback) {

    var args = require('yargs')
      .usage("Path to DB is required.")
      .demand(['db'])
      .argv;

    var dbPath = path.join(projectRoot, args.db);

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

