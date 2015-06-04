var co = require('co');
var fs = require('fs');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
const path = require('path');
const CourseGroup = require('../models/courseGroup');
const CourseParticipant = require('../models/courseParticipant');
const mailer = require('mailer');
const config = require('config');

module.exports = function() {

  return function() {

    var args = require('yargs')
      .example("gulp courses:group:send --slug nodejs --templatePath ./mail.jade --subject 'Тема письма'")
      .example("gulp courses:group:send --slug js-1405 --templatePath ./js-1405.jade --subject 'Курс JavaScript: напоминание о собрании' --test iliakan@gmail.com")
      .describe('slug', 'Название группы')
      .describe('templatePath', 'Шаблон для рассылки')
      .describe('subject', 'Тема письма')
      .describe('test', 'Email, на который выслать тестовое письмо.')
      .demand(['slug', 'templatePath', 'subject'])
      .argv;

    return co(function* () {
      var group = yield CourseGroup
        .findOne({slug: args.slug})
        .exec();

      if (!group) {
        throw new Error("No group:" + args.group);
      }

      var participants = yield CourseParticipant.find({group: group._id}).populate('user').exec();


      var recipients = participants
        .filter(function(participant) { return participant.shouldNotifyMaterials; })
        .map(function(participant) {
          return {email: participant.user.email, name: participant.fullName};
        });


      if (args.test) {
        recipients = [{email: args.test}];
      }

      yield* mailer.send({
        from:              'informer',
        templatePath:      args.templatePath,
        to:                recipients,
        subject:           args.subject,
        headers:           {
          Precedence:         'bulk',
          'List-ID':          `<${group.slug}.group.list-id.javascript.ru>`,
        }
      });

      gutil.log("Created letter to " + JSON.stringify(recipients));


    });
  };
};
