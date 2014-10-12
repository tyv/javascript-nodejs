var webpack = require('webpack');
var gp = require('gulp-load-plugins')();

module.exports = function() {

  return function(callback) {

    var config = require('config/webpack');
    webpack(config, function(err, stats) {
      if (err) {
        throw new gp.util.PluginError('webpack', err);
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
