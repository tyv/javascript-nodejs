var secret = require('./secret');

module.exports = {
  facebook:  {
    appId:           secret.facebook.appId,
      appSecret:       secret.facebook.appSecret,
      passportOptions: {
      display: 'popup',
        scope:   ['email']
    }
  },
  google:    {
    appId:           secret.google.appId,
      appSecret:       secret.google.appSecret,
      passportOptions: {
      scope: [
        'profile',
        // https://www.googleapis.com/auth/plus.login - request access to circles (not needed)
        // 'https://www.googleapis.com/auth/plus.profile.emails.read' - also works
        'email'
      ]
    }
  },
  github:    {
    appId:           secret.github.appId,
      appSecret:       secret.github.appSecret,
      passportOptions: {
      scope: 'user:email'
    }
  },
  yandex:    {
    appId:           secret.yandex.appId,
      appSecret:       secret.yandex.appSecret,
      passportOptions: {}
  },
  vkontakte: {
    appId:           secret.vkontakte.appId,
      appSecret:       secret.vkontakte.appSecret,
      passportOptions: {
      scope: 'email'
    }
  }
};