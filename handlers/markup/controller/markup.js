var join = require('path').join;
var fs = require('fs');
var path = require('path');

exports.get = function *get(next) {
  var templatePath = this.params.path;

  if (!fs.existsSync(path.join(__dirname, 'templates', templatePath))) {
    this.throw(404);
  }

  this.body = this.render(templatePath);
};

