var fs = require('fs');

// juice does not work w/ node 0.11

var Styliner = require('styliner');

var path = require('path');

module.exports = function*(html) {

  var styliner = new Styliner('.', { compact: false });
  var result = yield styliner.processHTML(html, '.');

  return result;
};
