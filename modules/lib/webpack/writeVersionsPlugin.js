var fs = require('fs');

function WriteVersionsPlugin(file) {
  this.file = file;
}

WriteVersionsPlugin.prototype.writeStats = function(compiler, stats) {
  stats = stats.toJson();
  //console.log(stats.assetsByChunkName);
  var assetsByChunkName = stats.assetsByChunkName;

  for (var name in assetsByChunkName) {
    if (assetsByChunkName[name] instanceof Array) {
      assetsByChunkName[name] = assetsByChunkName[name][0];
    }
    assetsByChunkName[name] = compiler.options.output.publicPath + assetsByChunkName[name];
  }

  fs.writeFileSync(this.file, JSON.stringify(assetsByChunkName));
};

WriteVersionsPlugin.prototype.apply = function(compiler) {
  compiler.plugin("done", this.writeStats.bind(this, compiler));
};

module.exports = WriteVersionsPlugin;