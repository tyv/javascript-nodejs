var fs = require('fs');
var path = require('path');
var config = require('config');
var isDevelopment = (process.env.NODE_ENV === 'development');
var isProduction = (process.env.NODE_ENV === 'production');
var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var WriteVersionsPlugin = require('lib/webpack/writeVersionsPlugin');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

var del = require('del');

var webpackConfig = {
  output:     {
    // fs path
    path:          './public/js',
    // path as js sees it
    publicPath:    '/js/',
    // в dev-режиме файлы будут вида [name].js, но обращения - через [name].js?[hash], т.е. версия учтена
    // в prod-режиме не можем ?, т.к. CDN его обрезают, поэтому [hash] в имени
    //  (какой-то [hash] здесь необходим, иначе к chunk'ам типа 3.js, которые генерируются require.ensure,
    //  будет обращение без хэша при загрузке внутри сборки. при изменении - барузерный кеш их не подхватит)
    filename:      isDevelopment ? "[name].js?[hash]" : "[name].[hash].js",
    chunkFilename: isDevelopment ? "[id].js?[hash]" : "[id].[hash].js"
    // the setting below does not work with CommonsChunkPlugin
    //library:       '[name]'
  },
  cache:      isDevelopment,
  watchDelay: 10,
  watch:      isDevelopment,

  devtool: isDevelopment ? "inline-source-map" : '',

  entry: {
    angular:  'client/angular',
    head:     'client/head',
    tutorial: 'tutorial/client',
    profile:  'profile/client',
    footer:   'client/footer'
  },


  externals: {
    // require("angular") is external and available
    // on the global var angular
    "angular": "angular"
  },

  module: {
    loaders: [
      {test: /\.jade$/, loader: "jade?root=" + config.projectRoot + '/templates'},
      // commonInterop means that "export default smth" becomes "module.exports = smth"
      // (unless there are other exports, see "modules" doc in 6to5
      {test: /\.js$/, exclude: /node_modules\/angular/, loader: '6to5-loader?modules=commonInterop'}
    ],
    noParse: [
      // regexp gets full path with loader like
      // '/js/javascript-nodejs/node_modules/client/angular.js'
      // or even
      // '/js/javascript-nodejs/node_modules/6to5-loader/index.js?modules=commonInterop!/js/javascript-nodejs/node_modules/client/head/index.js'
      /node_modules\/angular/
    ]
  },

  resolve: {
    alias: {
      lodash:          'lodash/dist/lodash',
      angular:         'angular/angular',
      angularRouter:   'angular-ui-router/release/angular-ui-router',
      angularCookies:  'angular-cookies/angular-cookies',
      angularResource: 'angular-resource/angular-resource'
    }
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    // lodash is loaded when free variable _ occurs in the code
    new webpack.ProvidePlugin({
      _: 'lodash'
    }),
    // any common chunks from entries go to head
    new CommonsChunkPlugin("head", isDevelopment ? "head.js?[hash]" : "head.[hash].js"),
    new WriteVersionsPlugin(path.join(config.manifestRoot, "js.versions.json")),
    function clearBeforeRun() {
      function clear(compiler, callback) {
        del.sync(this.options.output.path + '/*');
        callback();
      }

      this.plugin('run', clear);
      this.plugin('watch-run', clear);
    }
  ]
};


if (isProduction) {
  webpackConfig.plugins.push(
    new ngAnnotatePlugin({ // add angular annotations with ng-strict-di to ensure it's correct
      add: true
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // don't show unreachable variables etc
        warnings: false,
        drop_console: true,
        unsafe: true
      }
    })
  );
}

module.exports = webpackConfig;
