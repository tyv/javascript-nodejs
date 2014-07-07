var path = require('path');

module.exports = function() {
  return {
    "port": process.env.PORT || 3000,
    "host": process.env.HOST || '0.0.0.0',
    "mongoose": {
      "uri": "mongodb://localhost/javascript",
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
      "keys": ["KillerIsJim"]
    },
    template: {
      path: path.join(process.cwd(), 'views'),
      options: {
        'default': 'jade',
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