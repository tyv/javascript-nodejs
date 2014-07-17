const fs = require('fs');
const path = require('path');

module.exports = function(app) {

  app.hmvc = {};

  var hmvcAppDirs = fs.readdirSync(path.join(process.cwd(), 'hmvc'));

  for (var i = 0; i < hmvcAppDirs.length; i++) {
    var dir = hmvcAppDirs[i];
    app.hmvc[dir] = require(path.join(process.cwd(), 'hmvc', dir));
  }

};
