var path = require('path');
var env = process.env;

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

//if (!env.SITE_HOST) throw new Error("env.SITE_HOST is not set");
//if (!env.STATIC_HOST) throw new Error("env.STATIC_HOST is not set");

var secret = require('./secret');

module.exports = {
  server: {
    port:       env.PORT || 3000,
    host:       env.HOST || '0.0.0.0',
    siteHost:   env.SITE_HOST || '',
    staticHost: env.STATIC_HOST || ''
  },

  test: {
    e2e: {
      sshHost:  secret.test.e2e.sshHost, // remote host for testing e2e callbacks
      sshUser:  secret.test.e2e.sshUser,
      siteHost: secret.test.e2e.siteHost,
      browser:  env.E2E_BROWSER || 'firefox'
    }
  },

  mongoose: require('./mongoose'),

  cloudflare: {
    url:    'https://www.cloudflare.com/api_json.html',
    apiKey: secret.cloudflare.apiKey,
    email:  secret.cloudflare.email
  },

  xmpp: {
    admin: secret.xmpp.admin
  },

  appKeys:  [secret.sessionKey],
  auth:     {
    session:    {
      key:     'sid',
      prefix:  'sess:',
      cookie:  {
        httpOnly:  true,
        path:      '/',
        overwrite: true,
        signed:    true,
        maxAge:    3600 * 4 * 1e3 // session expires in 4 hours, remember me lives longer
      },
      // touch session.updatedAt in DB & reset cookie on every visit to prolong the session
      // koa-session-mongoose resaves the session as a whole, not just a single field
      rolling: true
    },
    rememberMe: {
      key:    'remember',
      cookie: {
        httpOnly:  true,
        path:      '/',
        overwrite: true,
        signed:    true,
        maxAge:    7 * 3600 * 24 * 1e3 // 7days
      }
    },

    providers: require('./authProviders')
  },
  payments: require('./payments'),

  imgur:    secret.imgur,
  adminKey: secret.adminKey,

  certDir: path.join(secret.dir, 'cert'),

  openexchangerates: {
    appId: secret.openexchangerates.appId
  },

  jb:      secret.jb,
  lang:    env.NODE_LANG || 'ru',
  elastic: {
    host: 'localhost:9200'
  },

  plnkrAuthId: secret.plnkrAuthId,

  assetVersioning: env.ASSET_VERSIONING == 'file' ? 'file' :
                     env.ASSET_VERSIONING == 'query' ? 'query' : null,

  mailer: require('./mailer'),

  jade:   {
    basedir: path.join(process.cwd(), 'templates'),
    cache:   env.NODE_ENV != 'development'
  },
  crypto: {
    hash: {
      length:     128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: env.NODE_ENV == 'production' ? 12000 : 1
    }
  },

  sauceLabs: {
    username:  secret.sauceLabs.username,
    accessKey: secret.sauceLabs.accessKey,
    address:   'http://ondemand.saucelabs.com:80/wd/hub'
  },

  renderedCacheEnabled: env.NODE_ENV == 'production',
  projectRoot:          process.cwd(),
  // public files, served by nginx
  publicRoot:           path.join(process.cwd(), 'public'),
  // private files, for expiring links, not directly accessible
  downloadRoot:         path.join(process.cwd(), 'download'),
  courseRoot:           path.join(process.cwd(), 'course'),
  tmpRoot:              path.join(process.cwd(), 'tmp'),
  // extra handlers from outside of the main repo
  extraHandlersRoot:    path.join(process.cwd(), 'extra/handlers'),
  // js/css build versions
  manifestRoot:         path.join(process.cwd(), 'manifest')
};

// webpack config uses general config
// we have a loop dep here
module.exports.webpack = require('./webpack');
require('./i18n');

