// this file contains all passwords etc,
// should not be in repo

module.exports = {
  sessionKey: "KillerIsJim",
  adminKey:   'admin',

  webmoney:    {},
  yandexmoney: {},
  paypal:      {
    myCertPath:     __dirname,
    myKeyPath:      __dirname,
    paypalCertPath: __dirname
  },
  payanyway:   {},

  // dev credentials
  imgur: {
    url: 'https://api.imgur.com/3/',
    clientId: '658726429918c83',
    clientSecret: '9195ed91c629b9c933187d3eba8a4d0567ba4644'
  },

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
  amazonSes: {},
  sauceLabs: {}

};
