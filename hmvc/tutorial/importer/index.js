var chokidar = require('chokidar');
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
        console.log("onchange", path);
        livereload.changed(path);
      }
    });


    var watcher = chokidar.watch(root, {ignoreInitial: true});

    watcher.on('add', onModify.bind(null, false));
    watcher.on('change', onModify.bind(null, false));
    watcher.on('unlink', onModify.bind(null, false));
    watcher.on('unlinkDir', onModify.bind(null, true));
    watcher.on('addDir', onModify.bind(null, true));

    function onModify(isDir, filePath) {
      if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

      var relFilePath = filePath.slice(root.length+1);

      co(function* () {
        var fileName = path.basename(filePath);
        var folder;
        if (!isDir) {
          folder = path.dirname(filePath);
        } else {
          folder = filePath;
        }

        yield* importer.sync(folder);

      }).catch(function(err) {
        throw err;
      });
    }

  };

};

