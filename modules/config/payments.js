var secret = require('./secret');

module.exports = {
  currency: 'RUB',
  supportEmail: 'orders@javascript.ru',
  modules:  {
    webmoney:    {
      secretKey: secret.webmoney.secretKey,
      purse:     secret.webmoney.purse
    },
    yandexmoney: {
      // full redirectUri, with host, because form-creating function isn't middleware, doesn't know context
      redirectUri: process.env.SITE_HOST + '/payments/yandexmoney/back',
      clientId:     secret.yandexmoney.clientId,
      clientSecret: secret.yandexmoney.clientSecret,
      purse:        secret.yandexmoney.purse
    },

    // todo: fix signature calculation
    payanyway:   {
      id:     secret.payanyway.id,
      secret: secret.payanyway.secret
    },

    paypal: {
      callbackUrl: process.env.SITE_HOST + '/payments/paypal/callback',
      cancelUrl: process.env.SITE_HOST + '/payments/paypal/cancel',
      successUrl: process.env.SITE_HOST + '/payments/paypal/success',
      email:          secret.paypal.email,
      myCertPath:     secret.paypal.myCertPath,
      myKeyPath:      secret.paypal.myKeyPath,
      paypalCertPath: secret.paypal.paypalCertPath,
      certId:         secret.paypal.certId
    }
  }
};