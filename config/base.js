var path = require('path');
var fs = require('fs');

var secretPath = fs.existsSync(path.join(__dirname, 'secret')) ? './secret' : './secret.default';
var secret = require(secretPath);

module.exports = function() {

  return {
    "port": process.env.PORT || 3000,
    "host": process.env.HOST || '0.0.0.0',
    "mongoose": {
      "uri": "mongodb://localhost/" + (process.env.NODE_ENV == 'test' ? "js_test" : "js"),
      "options": {
        "server": {
          "socketOptions": {
            "keepAlive": 1
          },
          "poolSize": 5
        }
      }
    },
    "session": {
      "keys": [secret.SESSION_KEY]
    },
    template: {
      options: {
        'cache': process.env.NODE_ENV != 'development'
      }
    },
    crypto: {
      hash: {
        length: 128,
        // may be slow(!): iterations = 12000 take ~60ms to generate strong password
        iterations: process.env.NODE_ENV == 'prod' ? 12000 : 1
      }
    },
    publicPath: path.join(process.cwd(), 'www')
  };
};
