"use strict";

const CourseInvite = require('../models/courseInvite');
const CourseParticipant = require('../models/courseParticipant');
const CourseGroup = require('../models/courseGroup');
const CourseFeedback = require('../models/courseFeedback');

/**
 * The order form is sent to checkout when it's 100% valid (client-side code validated it)
 * It uses order.module.createOrderFromTemplate to create an order, it can throw if something's wrong
 * the order CANNOT be changed after submitting to payment
 * @param next
 */
exports.get = function*(next) {

  var user = this.userById;

  if (String(this.user._id) != String(user._id)) {
    this.throw(403);
  }

  // active invites
  var invites = yield CourseInvite.find({
    email: user.email,
    accepted: false
  }).populate('group').exec();

  // plus groups where participates
  var participant = yield CourseParticipant.findOne({
    user: user._id
  }).exec();

  var groups;
  if (participant) {
    // plus groups where participates
    groups = yield CourseGroup.find({
      participants: participant._id
    }).exec();
  } else {
    groups = [];
  }

  this.body = [];

  for (let i = 0; i < invites.length; i++) {
    let group = invites[i].group;
    yield CourseGroup.populate(group, {path: 'course'});
    let groupInfo = formatGroup(group);
    groupInfo.links = [{
      url: group.course.getUrl(),
      title: 'Описание курса'
    }];
    groupInfo.inviteUrl = '/courses/invite/' + invites[i].token;
    this.body.push(groupInfo);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    yield CourseGroup.populate(group, {path: 'course'});

    let hasFeedback = yield CourseFeedback.findOne({
      courseGroup: group._id,
      participant: participant._id
    }).exec();

    let groupInfo = formatGroup(group);
    groupInfo.hasFeedback = hasFeedback;
    groupInfo.feedbackLink = `/courses/groups/${group.slug}/feedback`;

    groupInfo.links = [{
      url: group.course.getUrl(),
      title: 'Описание курса'
    }, {
      url: `/courses/groups/${group.slug}/info`,
      title: 'Инструкции по настройке окружения'
    }];

    if (groups[i].materials) {
      groupInfo.links.push({
        url: `/courses/groups/${group.slug}/materials`,
        title: 'Материалы для обучения'
      });
    }
    this.body.push(groupInfo);
  }

  for (var i = 0; i < this.body.length; i++) {
    var groupInfo = this.body[i];
    groupInfo.status = groupInfo.inviteUrl ? 'invite' :
      (groupInfo.dateStart > new Date()) ? 'accepted' :
        (groupInfo.dateEnd > new Date()) ? 'started' : 'ended';
  }


};

function formatGroup(group) {
  return {
    title: group.title,
    dateStart: group.dateStart,
    dateEnd: group.dateEnd,
    timeDesc: group.timeDesc
  };
}
