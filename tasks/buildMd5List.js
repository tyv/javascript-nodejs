const gulp = require('gulp');
const buster = require('gulp-buster');
const gs = require('glob-stream');
const gp = require('gulp-load-plugins')();
const through = require('through2');
const fs = require('fs');
const getContents = require('vinyl-fs/lib/src/getContents');
var File = require('vinyl');

buster.config('length', 8);

function createFile (globFile, enc, cb) {
  cb(null, new File(globFile));
}

function getStats() {
  return through.obj(fetchStats);
}

function fetchStats(file, enc, cb) {
  fs.stat(file.path, function (err, stat) {
    if (err && err.code == 'ENOENT') return cb();

    if (stat) {
      file.stat = stat;
    }
    cb(err, file);
  });
}


module.exports = function(options) {

  function src(glob, options) {
    var globStream = gs.create(glob, options);

    // when people write to use just pass it through
    var outputStream = globStream
      .pipe(through.obj(createFile))
      .pipe(getStats(options));

    if (options.read !== false) {
      outputStream = outputStream
        .pipe(getContents(options));
    }

    return outputStream
      .pipe(through.obj());
  }

  return function() {
    console.log("RUN");
    var s = src(options.src, { cwd: options.cwd, read: true, buffer: true });
    return s.pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
//      .pipe(gp.debug())
      .pipe(buster(options.dst))
      .pipe(gulp.dest('.'))
      .on('end', function() {
        console.log("END");
//        process.exit(1);
      });
  };

};

