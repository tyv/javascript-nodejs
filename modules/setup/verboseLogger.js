const VerboseLogger = require('lib/verboseLogger').VerboseLogger;


module.exports = function(app) {

  app.verboseLogger = new VerboseLogger();
  app.use(app.verboseLogger.middleware());

};
