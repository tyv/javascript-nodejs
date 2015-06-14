"use strict";

var co = require('co');
var fs = require('fs');
var _ = require('lodash');
var log = require('log')();
var gutil = require('gulp-util');
const path = require('path');
const CourseGroup = require('../models/courseGroup');
const CourseParticipant = require('../models/courseParticipant');
const mailer = require('mailer');
const config = require('config');

module.exports = function() {

  return function() {

    var args = require('yargs')
      .example("gulp courses:group:send --group nodejs --templatePath ./mail.jade --subject 'Тема письма'")
      .example("gulp courses:group:send --group js-1405 --templatePath ./js-1405.jade --subject 'Курс JavaScript: напоминание о собрании' --test iliakan@gmail.com")
      .example("gulp courses:group:send --group js-1405 --templatePath ./js-1405.jade --subject 'Курс JavaScript: напоминание о собрании'")
      .describe('group', 'Название группы')
      .describe('templatePath', 'Шаблон для рассылки, имя файла становится меткой для письма. При повторной посылке файла с тем же именем те email, которым отправлялись письма с этой меткой раньше, игноируются')
      .describe('subject', 'Тема письма')
      .describe('test', 'Email, на который выслать тестовое письмо.')
      .demand(['group', 'templatePath', 'subject'])
      .argv;

    return co(function* () {
      var group = yield CourseGroup
        .findOne({slug: args.group})
        .exec();

      if (!group) {
        throw new Error("No group:" + args.group);
      }

      var participants = yield CourseParticipant.find({group: group._id}).populate('user').exec();

      var recipients = participants
        .map(function(participant) {
          return {email: participant.user.email, name: participant.fullName};
        });

      // filter out already received
      var recipientsByEmail = _.indexBy(recipients, 'email');

      var label = path.basename(args.templatePath);

      let letters = yield mailer.Letter.find({label: label}).exec();
      for (let i = 0; i < letters.length; i++) {
        let to = letters[i].message.to;
        for (let j = 0; j < to.length; j++) {
          let previousRecepient = to[j];
          delete recipientsByEmail[previousRecepient.email];
        }
      }

      var recipientsToSend = _.values(recipientsByEmail);

      if (args.test) {
        recipientsToSend = [{email: args.test}];
      }

      if (recipientsToSend.length) {
        yield* mailer.send({
          from:         'informer',
          templatePath: args.templatePath,
          to:           recipients,
          subject:      args.subject,
          label:        args.test ? undefined : label,
          headers:      {
            Precedence: 'bulk',
            'List-ID':  `<${group.slug}.group.list-id.javascript.ru>`
          }
        });

        gutil.log("Sent letter to " + JSON.stringify(recipientsToSend));
      } else {
        gutil.log(`No recipients (was ${recipients.length} before label exclusion)`);
      }

    });
  };
};
