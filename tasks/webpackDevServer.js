var webpack = require('webpack');
var config = require('config');
var gutil = require('gulp-util');
var gulp = require('gulp');

module.exports = function() {

  return function(callback) {

    // Start a webpack-dev-server
    var compiler = require('webpack')(config.webpack);

    var WebpackDevServer = require("webpack-dev-server");
    var gutil = require("gulp-util");

    var hostname = require('url').parse(process.env.STATIC_HOST).hostname;

    new WebpackDevServer(compiler, config.webpack.devServer)
      .listen(config.webpack.devServer.port, hostname, function(err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        gutil.log("[webpack-dev-server]", `${process.env.STATIC_HOST}:${config.webpack.devServer.port}/webpack-dev-server/index.html`);

        // keep the server alive or continue?
        // callback();
      });

  };
};
