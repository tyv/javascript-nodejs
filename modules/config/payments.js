var secret = require('./secret');

module.exports = {
  currency:     'RUB',
  supportEmail: 'orders@javascript.ru',
  modules:      {
    webmoney:    {
      secretKey: secret.webmoney.secretKey,
      purse:     secret.webmoney.purse
    },
    yandexmoney: {
      // full redirectUri, with host, because form-creating function isn't middleware, doesn't know context
      redirectUri:  process.env.SITE_HOST + '/payments/yandexmoney/back',
      clientId:     secret.yandexmoney.clientId,
      clientSecret: secret.yandexmoney.clientSecret,
      purse:        secret.yandexmoney.purse
    },

    // todo: fix signature calculation
    payanyway:   {
      id:     secret.payanyway.id,
      secret: secret.payanyway.secret
    },

    banksimple: secret.banksimple,

    paypal: {
      email:    secret.paypal.email,
      pdtToken: secret.paypal.pdtToken
    }
  }
};
