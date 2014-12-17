/* UNFINISHED UNUSED
var SourceMapSource = require('webpack/lib/SourceMapSource');
var injector = require('angular-injector');

function AngularInjectorPlugin(files) {
  this.files = files;
}

WriteVersionsPlugin.prototype.apply = function(compiler) {
  var files = this.files;

  compiler.plugin('compilation', function(compilation) {

    compilation.plugin('optimize-chunk-assets', function(chunks, callback) {

      chunks.forEach(function(chunk) {

      });

      files = []

        chunks.forEach (chunk) ->
          files = files.concat chunk.files

        files = files.concat compilation.additionalChunkAssets

        files.forEach (file) ->
          if not options.exclude? or not options.exclude.test file
            map = compilation.assets[file].map()
            source = injector.annotate compilation.assets[file].source(), options
            compilation.assets[file] = new OriginalSource source, file, map

        callback()

    });
  });
};

module.exports = AngularInjectorPlugin;

*/