var join = require('path').join;
var fs = require('fs');
var path = require('path');

exports.get = function *get(next) {
  var templatePath = this.params.path;

  var fullPath = path.join(this.templateDir, templatePath) + '.jade';

  if (!fs.existsSync(fullPath)) {
    this.throw(404);
  }

  this.body = this.render(templatePath);
};

