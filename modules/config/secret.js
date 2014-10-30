var path = require('path');
var fs = require('fs');

var secretDir = process.env.SECRET_DIR || '/js/secret';

if (fs.existsSync(path.join(secretDir, 'secret.js'))) {
  module.exports = require(path.join(secretDir, 'secret'));
} else {
  module.exports = require('./secret.example');
}



