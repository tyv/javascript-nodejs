var fs = require('fs');
var path = require('path');
var config = require('config');
var isDevelopment = (process.env.NODE_ENV === 'development');
var isProduction = (process.env.NODE_ENV === 'production');
var webpack = require('webpack');
var del = require('del');

var webpackConfig = {
  output:     {
    path:          './public/js',
    publicPath:    '/js/',
    // в dev-режиме файлы будут вида [name].js, но обращения - через [name].js?[hash], т.е. версия учтена
    // в prod-режиме не можем ?, т.к. CDN его обрезают, поэтому [hash] в имени
    //  (какой-то [hash] здесь необходим, иначе к chunk'ам типа 3.js, которые генерируются require.ensure,
    //  будет обращение без хэша при загрузке внутри сборки. при изменении - барузерный кеш их не подхватит)
    filename:      isDevelopment ? "[name].js?[hash]" : "[name].[hash].js",
    chunkFilename: isDevelopment ? "[id].js?[hash]" : "[id].[hash].js",
    library:       '[name]'
  },
  cache:      isDevelopment,
  watchDelay: 10,
  watch:      isDevelopment,
  devtool:    isDevelopment ? "source-map" : '',

  entry:  {
    head:     'client/head',
    tutorial: 'tutorial/client',
    footer:   'client/footer'
  },
  module: {
    loaders: [
      {test: /\.jade$/, loader: "jade"}
    ]
  },

  plugins: [
    //new CommonsChunkPlugin("init", "init.js")
    new WriteVersionsPlugin(path.join(config.tmpRoot, "js.versions.json"))
  ]
};


webpackConfig.plugins.push(function() {
  function clear(compiler, callback) {
    del.sync(this.options.output.path + '/*');
    callback();
  }

  this.plugin('run', clear);
  this.plugin('watch-run', clear);
});

if (isProduction) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  );
}

function WriteVersionsPlugin(file) {
  this.file = file;
}

WriteVersionsPlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin("done", function(stats) {
    stats = stats.toJson();
    //console.log(stats.assetsByChunkName);
    var assetsByChunkName = stats.assetsByChunkName;

    for (var name in assetsByChunkName) {
      if (assetsByChunkName[name] instanceof Array) {
        assetsByChunkName[name] = assetsByChunkName[name][0];
      }
      assetsByChunkName[name] = this.options.output.publicPath + assetsByChunkName[name];
    }

    fs.writeFileSync(self.file, JSON.stringify(assetsByChunkName));
  });
};

module.exports = webpackConfig;
