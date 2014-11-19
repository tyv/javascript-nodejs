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
var ejs = require('ejs');
var through = require('through2');

module.exports = function() {
  return function() {

    var args = require('yargs')
      .usage("Prefix where to put config files is required and environment for the config.")
      .demand(['prefix', 'env'])
      .argv;

    var locals = {
      env: args.env
    };

    return gulp.src(path.join(projectRoot, 'nginx', '**'))
      .pipe(through.obj(function (file, enc, cb) {
        try {
          file.contents = ejs.render(file.contents.toString(), locals);
        } catch (err) {
          this.emit('error', new gp.util.PluginError('configNginx', err));
        }

        this.push(file);
        cb();
      }))
      .pipe(gulp.dest(args.prefix));
  };
};
