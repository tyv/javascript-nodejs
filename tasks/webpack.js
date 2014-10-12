var webpack = require('webpack');
var gp = require('gulp-load-plugins')();
var notifier = require('node-notifier');

module.exports = function() {

  return function(callback) {

    var config = require('config/webpack');
    webpack(config, function(err, stats) {
      if (!err) {
        var jsonStats = stats.toJson();
        err = jsonStats.errors[0] || jsonStats.warnings[0];
      }

      if (err) {

        notifier.notify({
          message: err
        });

        gp.util.log(err.message);

      }

      gp.util.log('[webpack]', stats.toString({
        hash: false,
        version: false,
        timings: true,
        assets: true,
        chunks: false,
        modules: false,
        cached: true,
        colors: true
      }));

      if (!config.watch) callback();
    });

  };
};
