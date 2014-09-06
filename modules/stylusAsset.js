var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    nodes = require('stylus').nodes,
    utils = require('stylus').utils;

module.exports = function() {
  return function(style) {
    var paths = style.options.paths || [];

    var renderer = this;
    style.define('asset', function(url) {
      var literal = new nodes.Literal('url("' + url.val + '")');

      var evaluator = this;
      var file = utils.lookup(url.val, paths);

      if (!file) {
        throw new Error('File ' + literal + ' not be found');
      }

      var version;
      if (process.env.NODE_ENV == 'development') {
        version = fs.statSync(file).mtime.getTime();
      } else {
        var buf = fs.readFileSync(file);
        version = crypto.createHash('md5').update(buf).digest('hex').substring(0, 8);
      }

      var ext = path.extname(url.val);
      var filepath = url.val.slice(0, url.val.length - ext.length);

      literal = new nodes.Literal('url("/i/' + filepath + '.v' + version + ext + '")');

      return literal;
    });
  };
};
