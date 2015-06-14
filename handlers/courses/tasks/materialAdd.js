const path = require('path');
const sendMail = require('mailer').send;
const config = require('config');
const co = require('co');
const gutil = require('gulp-util');
const yargs = require('yargs');
const CourseMaterial = require('../models/courseMaterial');
const CourseGroup = require('../models/courseGroup');
const CourseParticipant = require('../models/courseParticipant');
const User = require('users').User;
const _ = require('lodash');

module.exports = function() {

  return function() {

    const argv = require('yargs')
      // file should be in download/courses/js-1/js-basic.zip
      .usage('gulp courses:material:add --group js-1 --title "Введение" --file js-basic.zip --comment "Welcome."')
      .describe('group', 'Group slug')
      .describe('title', 'The name of the file to be shown on the group page')
      .describe('file', 'File name (must be in the group materials folder)')
      .describe('comment', 'A paragraph of text to append to the letter')
      .demand(['group', 'file'])
      .argv;


    return co(function*() {
      var group = yield CourseGroup
        .findOne({slug: argv.group})
        .exec();

      if (!group) {
        throw new Error("No group:" + argv.group);
      }

      var participants = yield CourseParticipant.find({group: group._id}).populate('user').exec();

      if (_.some(group.materials, {filename: argv.file})) {
        throw new Error(`Material ${argv.file} already exists in group ${argv.group}`);
      }

      var material = {
        title:    argv.title || argv.file,
        filename: argv.file
      };

      group.materials.push(material);

      yield group.persist();

      gutil.log(`Added ${argv.file} to group ${argv.group}`);

      var recipients = participants
        .filter(function(participant) { return participant.shouldNotifyMaterials; })
        .map(function(participant) {
          return {email: participant.user.email, name: participant.fullName};
        });

      yield sendMail({
        templatePath: path.join(__dirname, '../templates/email/materials'),
        subject:      "Добавлены материалы курса",
        to:           recipients,
        comment:      argv.comment,
        link:         config.server.siteHost + `/courses/groups/${group.slug}/materials`,
        fileLink:     config.server.siteHost + `/courses/download/${group.slug}/${material.filename}`,
        fileTitle:    material.title
      });

      gutil.log("Sent notification to", recipients);

    });

  };

};
