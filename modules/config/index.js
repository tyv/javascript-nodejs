var path = require('path');
var env = process.env;

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

env.SITE_HOST = env.SITE_HOST || '';
env.STATIC_HOST = env.STATIC_HOST || '';

if (env.DEV_TRACE) require('./trace');

var secret = require('./secret');

module.exports = {
  port: env.PORT || 3000,
  host: env.HOST || '0.0.0.0',
  siteHost:   env.SITE_HOST,
  staticHost: env.STATIC_HOST,
  mongoose:   require('./mongoose'),
  session:      {
    keys: [secret.sessionKey]
  },
  payments: require('./payments'),

  imgur: secret.imgur,
  adminKey: secret.adminKey,

  authProviders: require('./authProviders'),

  plnkrAuthId: secret.plnkrAuthId,

  mailer:       require('./mailer'),
  jade:     {
    basedir: path.join(process.cwd(), 'templates'),
    cache: env.NODE_ENV != 'development'
  },
  crypto:       {
    hash: {
      length:     128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: env.NODE_ENV == 'prod' ? 12000 : 1
    }
  },
  projectRoot:  process.cwd(),
  publicRoot:   path.join(process.cwd(), 'public'),
  tmpRoot:      path.join(process.cwd(), 'tmp'),
  manifestRoot: path.join(process.cwd(), 'manifest')
};
