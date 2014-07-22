var path = require('path');
var fs = require('fs');

var secretPath = fs.existsSync(path.join(__dirname, 'secret.js')) ? './secret' : './secret.template';
var secret = require(secretPath);

module.exports = {
  "port":      process.env.PORT || 3000,
  "host":      process.env.HOST || '0.0.0.0',
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
  /*
  verboseLogger: {
    paths: ['/webmoney/any*']
  },
  */
  webmoney:    secret.webmoney,
  yandexmoney: secret.yandexmoney,
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
