var secret = require('./secret');

module.exports = {
  senders: {
    default: {
      from:     'JavaScript.ru <notify@javascript.ru>',
      signature: "<em>С уважением,<br>Илья Кантор</em>"
    },
    informer: {
      from:     'JavaScript.ru <informer@javascript.ru>',
      signature: "<em>С уважением,<br>Илья Кантор</em>"
    }
  },
  sqs:     {
    queueUrl: 'https://sqs.us-east-1.amazonaws.com/784793887268/learn-javascript-email-queue'
  },
  ses:     {
    accessKeyId:     secret.amazonSes.accessKeyId,
    secretAccessKey: secret.amazonSes.secretAccessKey,
    region: "us-east-1"
  }

};