var secret = require('./secret');

module.exports = {
  senders: {
    default: {
      from:     'JavaScript.ru <inform@javascript.ru>',
      signature: "<em>С уважением,<br>Илья Кантор</em>"
    }
  },
  ses:     {
    accessKeyId:     secret.amazonSes.accessKeyId,
    secretAccessKey: secret.amazonSes.secretAccessKey
  }

};