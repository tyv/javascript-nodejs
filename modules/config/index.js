if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV environment variable is required");
}

if (process.env.NODE_ENV == 'development' && process.env.DEV_TRACE) {
  // @see https://github.com/AndreasMadsen/trace
  require('trace'); // active long stack trace
  require('clarify'); // Exclude node internal calls from the stack
}


var path = require('path');
var fs = require('fs');

var secretPath = fs.existsSync(path.join(__dirname, 'secret.js')) ? './secret' : './secret.template';
var secret = require(secretPath);

module.exports = {
  "port":      process.env.PORT || 3000,
  "host":      process.env.HOST || '0.0.0.0',
  "domain":   "stage.javascript.ru",
  "mongoose":  {
    "uri":     "mongodb://localhost/" + (process.env.NODE_ENV == 'test' ? "js_test" : "js"),
    "options": {
      "server": {
        "socketOptions": {
          "keepAlive": 1
        },
        "poolSize":      5
      }
    }
  },
  session:     {
    keys: [secret.sessionKey]
  },
  payments: secret.payments,
  template:    {
    options: {
      'cache': process.env.NODE_ENV != 'development'
    }
  },
  crypto:      {
    hash: {
      length:     128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: process.env.NODE_ENV == 'prod' ? 12000 : 1
    }
  },
  publicPath:  path.join(process.cwd(), 'www')
};
