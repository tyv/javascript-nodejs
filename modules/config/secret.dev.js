// this file contains all passwords etc for development,
// prod version of this file should be out of the repo

module.exports = {
  sessionKey: "KillerIsJim",
  adminKey:   'admin',

  webmoney:    {},
  yandexmoney: {},
  paypal:      {},
  payanyway:   {},
  banksimple:  {},
  banksimpleua:  {},
  interkassa:  {},

  cloudflare: {},

  xmpp: {
    admin: {
      login: 'a',
      password: 'b'
    }
  },

  // dev credentials
  imgur: {
    url:          'https://api.imgur.com/3/',
    clientId:     '658726429918c83',
    clientSecret: '9195ed91c629b9c933187d3eba8a4d0567ba4644'
  },

  openexchangerates: {
    // login: mk@javascript.ru
    appId: "a41430df4d734553ae0edd5a932e8169"
  },

  test: {
    e2e: {
      sshHost:  null,
      sshUser:  null,
      siteHost: null
    }
  },

  mandrill: {
    apiKey:     'no mail please',
    webhookKey: 'no hooks for dev',
    webhookUrl: 'no hooks for dev'
  },

  jb:        {},
  facebook:  {
    appId:     '*',
    appSecret: '*'
  },
  google:    {
    appId:     '*',
    appSecret: '*'
  },
  github:    {
    appId:     '*',
    appSecret: '*'
  },
  yandex:    {
    appId:     '*',
    appSecret: '*'
  },
  vkontakte: {
    appId:     '*',
    appSecret: '*'
  },
  sauceLabs: {}

};
