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
var glob = require('glob');

var MigrationState = require('./models/migrationState');

/**
 * Usage:
 * --create name
 * @returns {Function}
 */
module.exports = function* migrate(direction) {

  // current migration date
  var migrationState = yield MigrationState.findOne({}).exec();
  if (!migrationState) {
    migrationState = yield MigrationState.create({
      currentMigration: 0
    });
  }

  var lastMigrationDate = migrationState.currentMigration;

  var migrationFiles = glob.sync(path.join(migrationsRoot, '*')).filter(function() {
    return parseInt(path.basename(migrationFile)); // only files like 20150505...
  });

  if (!migrationFiles.length) {
    gutil.log("Migrations not found");
  }

  var targetMigration;

  var migrationFile, migrationDate;

  if (direction > 0) {
    for (var i = 0; i < migrationFiles.length; i++) {
      migrationFile = migrationFiles[i];
      migrationDate = parseInt(path.basename(migrationFile));
      if (migrationDate > lastMigrationDate) {
        targetMigration = require(migrationFile).up;
        gutil.log("Migrating up", migrationFile);
        yield* targetMigration();
        yield migrationState.persist({
          currentMigration: migrationDate
        });
        return;
      }
    }

    gutil.log("No migrations found");

  } else {
    for (var i = migrationFiles.length - 1; i >= 0; i--) {
      var migrationFile = migrationFiles[i];
      var migrationDate = parseInt(path.basename(migrationFile));
      if (migrationDate == lastMigrationDate) {
        targetMigration = require(migrationFile).down;
        gutil.log("Migrating down", migrationFile);
        yield *targetMigration();
        yield migrationState.persist({
          currentMigration: i > 0 ? parseInt(path.basename(migrationFiles[i-1])) : 0
        });
        return;
      }
    }

    gutil.log("No migrations found");
  }


};
