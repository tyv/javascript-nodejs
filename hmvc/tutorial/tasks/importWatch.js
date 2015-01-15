var watch = require('../importer/watch');
var Importer = require('../importer/importer');
var co = require('co');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');
const log = require('log')();

module.exports = function(options) {

  return function(callback) {

    if (!options.root) {
      throw new Error("Import watch root is not provided");
    }

    var root = fs.realpathSync(options.root);

    if (!root) {
      throw new Error("Import watch root does not exist " + options.root);
    }

    var importer = new Importer({
      root:     root,
      onchange: function(path) {
        log.info("livereload.change", path);
        livereload.changed(path);
      }
    });

    livereload.listen();

    watch(root, function(filePath, flags, id) {

      var relFilePath = filePath.slice(root.length + 1);

      log.info("watch detected change on", filePath);

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


