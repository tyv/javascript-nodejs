
if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV environment variable is required");
}

if (process.env.NODE_ENV == 'development' && process.env.DEV_TRACE) {
  // @see https://github.com/AndreasMadsen/trace
  require('trace'); // active long stack trace
  require('clarify'); // Exclude node internal calls from the stack
}

var base = require('./base')();
var env = require('./env/' + process.env.NODE_ENV)(base);

module.exports = env;
