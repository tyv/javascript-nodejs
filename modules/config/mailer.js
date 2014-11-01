var secret = require('./secret');

module.exports = {
  senders: {
    default: {
      email:     'JavaScript.ru <inform@javascript.ru>',
      signature: "<p>Yours, robot</p>"
    }
  },
  ses:     {
    accessKeyId:     secret.amazonSes.accessKeyId,
    secretAccessKey: secret.amazonSes.secretAccessKey
  }

};