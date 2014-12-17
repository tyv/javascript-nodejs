var config = require('config');
var path = require('path');

exports.get = function* (next) {
  // aboutme -> return rendererd partials/aboutme.jade

  var partialJade = path.join('partials', path.basename(this.params.partial.replace(/\./g, '')));
  this.body = this.render(partialJade);
};

