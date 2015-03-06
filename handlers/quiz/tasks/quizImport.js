var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
var QuizImporter = require('../quizImporter');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to quiz root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    return co(function* () {

      var files = glob.sync(path.join(root, '*.yml'));

      for (var i = 0; i < files.length; i++) {
        var yml = files[i];

        gutil.log("Importing " + yml);

        var importer = new QuizImporter({
          yml: yml
        });


        yield* importer.import();
      }

      log.info("DONE");

    });
  };
};


