var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    nodes = require('stylus').nodes,
    utils = require('stylus').utils;

module.exports = function(options) {

  var getVersion = options.getVersion || function(file) {
    var buf = fs.readFileSync(file);
    return crypto.createHash('md5').update(buf).digest('hex').substring(0, 8);
  };

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

      var version = getVersion(file);

      var ext = path.extname(url.val);
      var filepath = url.val.slice(0, url.val.length - ext.length);

      var newUrl = process.env.CSS_NO_HASH ? url.val :
        (process.env.NODE_ENV == 'development') ? (url.val + '?' + version) :
        filepath + '.v' + version + ext;

      literal = new nodes.Literal('url("../i/' + newUrl + '")');

      return literal;
    });
  };
};
