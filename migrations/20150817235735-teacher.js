var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

exports.up = function*() {

};

exports.down = function*() {
  throw new Error("Rollback not implemented");
};
