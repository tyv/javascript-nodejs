var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var group = this.locals.group = this.groupBySlug;

  if (!this.user) {
    this.throw(401);
  }

  var participantsById = _.indexBy(group.participants, 'user');

  var participant = participantsById[this.user._id];
  if (!participant) {
    this.throw(403, "Вы не являетесь участником этой группы.");
  }

  this.body = this.render('groupMaterials', {
    videoKey: participant.videoKey
  });
};
