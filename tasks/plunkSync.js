const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const co = require('co');
const plunkSync = require('plunk').sync;

module.exports = function(options) {

  var root = fs.realpathSync(options.root);

  return function(callback) {

    gulp.src(path.join(root, '**', '.plnkr'))
      .pipe(through2.obj(function(file, enc, callback) {
        var plunkDir = path.dirname(file.path);

        co(plunkSync(plunkDir)).nodeify(callback);

      }));


  };


};

