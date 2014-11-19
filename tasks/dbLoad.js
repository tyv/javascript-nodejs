var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;

module.exports = function() {
  return function() {

    var args = require('yargs')
      .usage("Path to DB fixture file is required.")
      .demand(['from'])
      .argv;

    var dbPath = path.join(projectRoot, args.from);

    gutil.log("loading db " + dbPath);

    return co(function*() {

      yield* dataUtil.loadDb(dbPath);

      gutil.log("loaded db " + dbPath);
    });

  };
};

