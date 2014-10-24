var watch = require('../importer/watch');
var Importer = require('../importer/importer');
var co = require('co');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');

module.exports = function(options) {

  return function(callback) {

    var importer = new Importer({
      root: options.root,
      onchange: function(path) {
        livereload.changed(path);
      }
    });
    watch(options.root, function(filePath, flags, id) {
      var relFilePath = filePath.slice(options.root.length+1);

      co(function* () {
        var fileName = path.basename(filePath);
        var folder;
        if (flags & watch.FsEventsFlags.ItemIsFile) {
          folder = path.dirname(filePath);
        } else {
          folder = filePath;
        }

        yield* importer.sync(folder);

      })(function(err) {
        if (err) {
          throw err;
        }
      });
    });

  };

};


