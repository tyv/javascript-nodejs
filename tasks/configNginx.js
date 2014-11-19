/**
 * Copies nginx config to --prefix dir, passing through EJS template engine
 */

var fs = require('fs');
var co = require('co');
var path = require('path');
var gulp = require('gulp');
var gp = require('gulp-load-plugins')();
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;

module.exports = function() {
  return function() {

    var args = require('yargs')
      .usage("Prefix where to put config files is required and environment for the config.")
      .demand(['prefix', 'env'])
      .argv;

    return gulp.src(path.join(projectRoot, 'nginx', '**'))
      .pipe(gp.ejs({
        env: args.env
      }))
      .pipe(gulp.dest(args.prefix));
  };
};

