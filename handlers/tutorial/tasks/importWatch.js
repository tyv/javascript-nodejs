var Importer = require('../importer');
var co = require('co');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');
var log = require('log')();
var chokidar = require('chokidar');

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


    var subRoots = fs.readdirSync(root);
    subRoots = subRoots.filter(function(subRoot) {
      return parseInt(subRoot);
    }).map(function(dir) {
      return path.join(root, dir);
    });

    var figuresFilePath = path.join(root, 'figures.sketch');

    var watchDirs = subRoots.concat(figuresFilePath);

    var watcher = chokidar.watch(watchDirs, {ignoreInitial: true});

    watcher.on('add', onModify.bind(null, false));
    watcher.on('change', onModify.bind(null, false));
    watcher.on('unlink', onModify.bind(null, false));
    watcher.on('unlinkDir', onModify.bind(null, true));
    watcher.on('addDir', onModify.bind(null, true));

    function onModify(isDir, filePath) {
      if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

      co(function* () {

        //console.log('--> ' + filePath);
        if (filePath == figuresFilePath) {
          yield* importer.syncFigures(figuresFilePath);
          return;
        }

        var folder;
        if (isDir) {
          folder = filePath;
        } else {
          folder = path.dirname(filePath);
        }

        yield* importer.sync(folder);

      }).catch(function(err) {
        throw err;
      });
    }


  };

};


