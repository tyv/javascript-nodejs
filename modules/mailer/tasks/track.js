var fs = require('fs');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
const path = require('path');
const Letter = require('../models/letter');
const config = require('config');
const AWS = require('aws-sdk');
const co = require('co');
const thenify = require('thenify');

// Rerun me from CRON when I die
// I want to be running constantly
module.exports = function(options) {

  return function() {

    return co(function* () {

      AWS.config.update({
        accessKeyId: config.mailer.ses.accessKeyId,
        secretAccessKey: config.mailer.ses.secretAccessKey,
        region: config.mailer.ses.region
      });

      // https://milesplit.wordpress.com/2013/11/07/using-sqs-with-node/
      var sqs = new AWS.SQS();

      // hangs waiting for messages
      var response = yield receiveMessages();

      if (!response.Messages) return;

      for (var i = 0; i < response.Messages.length; i++) {
        var message = response.Messages[i];
        var receiptHandle = message.ReceiptHandle;
        var messageBody = JSON.parse(message.Body);
        var notificationBody = JSON.parse(messageBody.Message);

        var letter = yield Letter.findOne({
          'info.messageId': notificationBody.mail.messageId + '@email.amazonses.com'
        }).exec();

        if (!letter) {
          gutil.log("No letter for notification ", notificationBody);
          continue;
        }

        gutil.log(notificationBody.notificationType + " for " + letter.data.to);

        var notificationType = notificationBody.notificationType.toLowerCase();
        if (!letter.notification) letter.notification = {};
        letter.notification[notificationType] = notificationBody;

        yield letter.persist();

        // remove the message from the queue
        yield deleteMessage(receiptHandle);
      }

      function receiveMessages() {
        return thenify(sqs.receiveMessage.bind(sqs))({
          QueueUrl: config.mailer.sqs.queueUrl,
          AttributeNames: ['All'],
          MaxNumberOfMessages: 10, // how many messages do we wanna retrieve?
          VisibilityTimeout: 60, // seconds - how long we want a lock on this job
          WaitTimeSeconds: 20 // seconds - how long should we wait for a message?
        });
      }

      function* deleteMessage(receiptHandle) {
        return thenify(sqs.deleteMessage.bind(sqs))({
          QueueUrl:      config.mailer.sqs.queueUrl,
          ReceiptHandle: receiptHandle
        });
      }

    });

  };
};
