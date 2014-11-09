const VerboseLogger = require('lib/verboseLogger');

module.exports = function(app) {

  app.verboseLogger = new VerboseLogger();
  app.use(app.verboseLogger.middleware());

};
