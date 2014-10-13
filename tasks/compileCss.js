const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const fs = require('fs');
const crypto = require('crypto');
const es = require('event-stream');
const path = require('path');
const del = require('del');

module.exports = function(options) {

  function getAssetVersion(file) {
    if (process.env.NODE_ENV == 'development') {
      return fs.statSync(file).mtime.getTime().toString().replace(/0+$/, '').slice(-8);
    } else {
      var buf = fs.readFileSync(file);
      return crypto.createHash('md5').update(buf).digest('hex').substring(0, 8);
    }
  }

  return function() {

    var nib = require('nib')();
    var asset = require('lib/stylusAsset')({
      getVersion: getAssetVersion
    });

    del.sync(options.dst + '/*');

    var versions = {};
    return gulp.src(options.src)
      // without plumber if stylus emits PluginError, it will disappear at the next step
      // plumber propagates it down the chain
      .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
      .pipe(gp.stylus({use: [nib, asset]}))
      .pipe(gp.autoprefixer("last 1 version"))
      .pipe(gp.if(process.env.NODE_ENV == 'production', gp.minifyCss()))
      .pipe(es.map(function(file, cb) {
        var version = crypto.createHash('md5').update(file.contents).digest('hex').substring(0, 8);
        var name = path.basename(file.path).slice(0, -4);

        if (process.env.NODE_ENV == 'production') {
          file.path = file.path.replace(/\.css$/, '.' + version + '.css');
          versions[name] = options.publicDst + path.basename(file.path);
        } else {
          versions[name] = options.publicDst + path.basename(file.path) + '?' + version;
        }
        //console.log(versions);
        cb(null, file);
      }))
      .pipe(gulp.dest(options.dst))
      .on('end', function() {
        //console.log(options.manifest, versions);
        fs.writeFileSync(options.manifest, JSON.stringify(versions));
      });

  };


};

