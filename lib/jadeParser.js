const Parser = require('jade').Parser;
const util = require('util');
const pathModule = require('path');
const fs = require('fs');
const log = require('javascript-log')(module);

log.debugOn();

module.exports = function(dir) {

  function JadeParser(str, filename, options) {
    Parser.apply(this, arguments);
  }
  util.inherits(JadeParser, Parser);


  JadeParser.prototype.resolvePath = JadeParser.resolvePath = function(path, purpose) {
    console.log("!!!!!!! ", path);

    if (path[0] == '.') {

      path = pathModule.join(pathModule.dirname(this.filename), path) + '.jade';
      console.log("Resolve to ", path);
      return path;
    }

    var templateRoot = pathModule.resolve(dir);
    var top = pathModule.resolve(process.cwd());

    console.log("Look from ", templateRoot, "to", top);
    while (templateRoot != pathModule.dirname(top)) {
      var template = pathModule.join(templateRoot, 'template', path + '.jade');
      log.debug("-- try path", template);
      if (fs.existsSync(template)) {
        log.debug("-- found");
        return template;
      }
      log.debug("-- skipped");
      templateRoot = pathModule.dirname(templateRoot);
    }

    log.debug("-- end", templateRoot, top);
  };


  return JadeParser;


};
