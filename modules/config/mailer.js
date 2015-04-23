var secret = require('./secret');

module.exports = {
  senders:  {
    default:  {
      fromEmail: 'notify@javascript.ru',
      fromName:  'JavaScript.ru',
      signature: "<em>С уважением,<br>Илья Кантор</em>"
    },
    informer: {
      fromEmail: 'informer@javascript.ru',
      fromName:  'JavaScript.ru',
      signature: "<em>Успешной разработки!<br>Илья Кантор</em>"
    }
  },
  mandrill: {
    apiKey: secret.mandrill.apiKey,
    webhookKey: secret.mandrill.webhookKey,
    // current running site may have another domain (proxied from webhookurl)
    // that's why I set the webhookUrl separately
    webhookUrl: secret.mandrill.webhookUrl
  }


};
