
const Parser = require('jade').Parser;
const inherits = require('inherits');
const path = require('path');
var fs = require('fs');

// this jade parser knows templateDir through closure
function JadeParserMultipleDirs(str, filename, options) {
  Parser.apply(this, arguments);
  this.templatePaths = options.templatePaths;
}
inherits(JadeParserMultipleDirs, Parser);


JadeParserMultipleDirs.prototype.resolvePath = function(templatePath, purpose) {

  if (templatePath[0] !== '/') {
    return Parser.prototype.resolvePath.apply(this, arguments);
  }

  for (var i = 0; i < this.templatePaths.length; i++) {
    var root = this.templatePaths[i];

    var p = path.join(root, templatePath);
    if (path.extname(templatePath) === '') p  += '.jade';

    if (fs.existsSync(p)) return p;
  }

  throw new Error('Template ' + templatePath + ' not found in ' + this.templatePaths);
};

module.exports = JadeParserMultipleDirs;
