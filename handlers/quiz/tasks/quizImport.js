var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var QuizImporter = require('../quizImporter');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to quiz root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    var importer = new QuizImporter({
      root: root
    });

    return co(function* () {

      yield* importer.destroyAll();


      yield* importer.import();

      log.info("DONE");

    });
  };
};


