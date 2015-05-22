const mongoose = require('mongoose');
const glob = require('glob');
const migrationsRoot = require('config').migrationsRoot;
const MigrationState = require('migrate').MigrationState;
const path = require('path');

/**
 * Set current migration state to latest
 */
var migrationFiles = glob.sync(path.join(migrationsRoot, '*')).filter(function(migrationFile) {
  return parseInt(path.basename(migrationFile)); // only files like 20150505...
});


exports.MigrationState = [];

if (migrationFiles.length) {
  exports.MigrationState.push({
    currentMigration: parseInt(path.basename(migrationFiles.pop()))
  });
}



