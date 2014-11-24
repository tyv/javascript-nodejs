var watch = require('./watch');
var Importer = require('./importer');
var co = require('co');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');

module.exports = function(root) {

  return function(callback) {

    var importer = new Importer({
      root: root,
      onchange: function(path) {
        console.log(path);
        livereload.changed(path);
      }
    });
    watch(root, function(filePath, flags, id) {

      var relFilePath = filePath.slice(root.length+1);

      co(function* () {
        var fileName = path.basename(filePath);
        var folder;
        if (flags & watch.FsEventsFlags.ItemIsFile) {
          folder = path.dirname(filePath);
        } else {
          folder = filePath;
        }

        yield* importer.sync(folder);

      }).catch(function(err) {
        throw err;
      });
    });

  };

};

