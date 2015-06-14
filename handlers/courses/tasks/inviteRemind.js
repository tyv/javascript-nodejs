var co = require('co');
var _ = require('lodash');
var log = require('log')();
var gutil = require('gulp-util');
const path = require('path');
const CourseGroup = require('../models/courseGroup');
const CourseInvite = require('../models/courseInvite');
const mailer = require('mailer');
const config = require('config');

// send mail to all successful order participants
module.exports = function() {

  return function() {

    var args = require('yargs')
      .example("gulp invite:remind --group nodejs-1")
      .describe('group', 'URL-название группы')
      .demand(['group'])
      .argv;

    return co(function* () {
      var group = yield CourseGroup
        .findOne({slug: args.group})
        .exec();

      if (!group) {
        throw new Error("No group:" + args.group);
      }

      var invitesPending = yield CourseInvite.find({
        group:    group._id,
        accepted: false
      });

      for (var i = 0; i < invitesPending.length; i++) {
        var invite = invitesPending[i];

        yield* mailer.send({
          from:         'orders',
          templatePath: path.join(__dirname, '../templates/email/inviteRemind'),
          link:         config.server.siteHost + '/courses/invite/' + invite.token,
          to:           [{email: invite.email}],
          group:        group,
          subject:      group.title + ' - вы не присоединились к группе'
        });

      }

    });
  };
};
