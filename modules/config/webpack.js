/*
var isDevelopment = (process.env.NODE_ENV === 'development');
var isProduction = (process.env.NODE_ENV === 'production');
*/
var isDevelopment = true;
var isProduction = false;


var fs = require('fs');
var path = require('path');
var config = require('config');


var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var WriteVersionsPlugin = require('lib/webpack/writeVersionsPlugin');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');




var del = require('del');

// 3rd party / slow to build modules
// no webpack dependencies inside
// no es6 (for 6to5 processing) inside
// NB: includes angular-*
var noProcessModulesRegExp = /node_modules\/(angular|moment|prismjs)/;

function filenameTemplate(name) {
  return config.assetVersioning == 'query' ? name + ".js?[hash]" :
    config.assetVersioning == 'file' ? name + ".[hash].js" : name + ".js";
}

var webpackConfig = {
  output:     {
    // fs path
    path:       './public/js',
    // path as js sees it
    publicPath: '/js/',
    // в dev-режиме файлы будут вида [name].js, но обращения - через [name].js?[hash], т.е. версия учтена
    // в prod-режиме не можем ?, т.к. CDN его обрезают, поэтому [hash] в имени
    //  (какой-то [hash] здесь необходим, иначе к chunk'ам типа 3.js, которые генерируются require.ensure,
    //  будет обращение без хэша при загрузке внутри сборки. при изменении - барузерный кеш их не подхватит)
    filename:   filenameTemplate("[name]"),

    chunkFilename: filenameTemplate("[id]"),
    // the setting below does not work with CommonsChunkPlugin
    library:       '[name]'
  },
  cache:      isDevelopment,
  watchDelay: 10,
  watch:      isDevelopment,

  devtool: isDevelopment ? "inline-source-map" : '',

  entry: {
    angular:    'client/angular',
    head:       'client/head',
    tutorial:   'tutorial/client',
    profile:    'profile/client',
    search:     'search/client',
    quiz:       'quiz/client',
    getpdf:     'getpdf/client',
    footer:     'client/footer'
  },

  externals: {
    // require("angular") is external and available
    // on the global var angular
    "angular": "angular"
  },

  module: {
    loaders: [
      {test: /\.jade$/, loader: "jade?root=" + config.projectRoot + '/templates'},
      {
        test:    /\.js$/,
        exclude: noProcessModulesRegExp,
        loader:  'babel-loader'
      }
    ],
    noParse: [
      // regexp gets full path with loader like
      // '/js/javascript-nodejs/node_modules/client/angular.js'
      // or even
      // '/js/javascript-nodejs/node_modules/6to5-loader/index.js?modules=commonInterop!/js/javascript-nodejs/node_modules/client/head/index.js'
      noProcessModulesRegExp
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
    new CommonsChunkPlugin("head", filenameTemplate("head")),
    new WriteVersionsPlugin(path.join(config.manifestRoot, "js.versions.json")),
  ]
};


if (isProduction) {
  webpackConfig.plugins.push(
    function clearBeforeRun() {
      function clear(compiler, callback) {
        del.sync(this.options.output.path + '/*');
        callback();
      }

      // in watch mode this will clear between partial rebuilds
      // thus removing unchanged files
      // => use this plugin only in normal run
      this.plugin('run', clear);
    },

    new ngAnnotatePlugin({ // add angular annotations with ng-strict-di to ensure it's correct
      add: true
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // don't show unreachable variables etc
        warnings:     false,
        drop_console: true,
        unsafe:       true
      }
    })
  );
}

module.exports = webpackConfig;
