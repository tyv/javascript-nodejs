const JadeParserMultipleDirs = require('lib/jadeParserMultipleDirs');
const fs = require('fs');
const path = require('path');
const config = require('config');
const jade = require('jade');

require.extensions['.jade'] = function(module, filename) {

  var compiled = jade.compile(
    fs.readFileSync(filename, 'utf-8'),
    {
      pretty:        false,
      compileDebug:  false,
      filename:      filename,
      templatePaths: [path.join(config.projectRoot, 'templates')],
      parser:        require('lib/jadeParserMultipleDirs')
    }
  );

  module.exports = function(locals) {
    locals = locals || {};
    locals.bem = require('bem-jade')();

    return compiled(locals);
  };

//  console.log("---------------> HERE", fs.readFileSync(filename, 'utf-8'), module.exports);

};
