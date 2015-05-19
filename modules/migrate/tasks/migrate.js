var fs = require('fs');
var fse = require('fs-extra');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var migrationsRoot = require('config').migrationsRoot;
var yargs = require('yargs');
var moment = require('moment');


/**
 * Usage:
 * --create name
 * @returns {Function}
 */
module.exports = function() {

  var argv = require('yargs').argv;

  return function() {

    return co(function*() {

      if (argv.create) {
        var filepath = path.join(migrationsRoot, moment().format('YYYYMMDDHHmmss') + '-' + argv.create + '.js');
        fs.writeFileSync(filepath, migrationTemplate);
        gutil.log("creating", filepath);
      }

    });

  };

};
