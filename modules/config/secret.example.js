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
  amazonSes: {}
};
