"use strict";

const CourseInvite = require('../models/courseInvite');
const CourseParticipant = require('../models/courseParticipant');
const CourseGroup = require('../models/courseGroup');
const CourseFeedback = require('../models/courseFeedback');
const _ = require('lodash');

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
    email:    user.email,
    accepted: false
  }).populate('group').exec();

  // plus groups where participates
  var userParticipants = yield CourseParticipant.find({
    user:     user._id,
    isActive: true
  }).populate('group');

  var groups;
  if (userParticipants) {
    groups = _.pluck(userParticipants, 'group');
  } else {
    groups = [];
  }

  var groupInfoItems = [];

  for (let i = 0; i < invites.length; i++) {
    let group = invites[i].group;
    yield CourseGroup.populate(group, {path: 'course'});
    let groupInfo = formatGroup(group);
    groupInfo.links = [{
      url:   group.course.getUrl(),
      title: 'Описание курса'
    }];
    groupInfo.inviteUrl = '/courses/invite/' + invites[i].token;
    groupInfo.status = 'invite';
    groupInfoItems.push(groupInfo);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    yield CourseGroup.populate(group, {path: 'course'});

    let participant = userParticipants.filter(function(userParticipant) {
      return String(userParticipant.group._id) == String(group._id);
    })[0];

    let hasFeedback = yield CourseFeedback.findOne({
      group:       group._id,
      participant: participant._id
    }).exec();

    let groupInfo = formatGroup(group);
    if (!hasFeedback) {
      groupInfo.feedbackLink = `/courses/groups/${group.slug}/feedback`;
    }

    groupInfo.links = [{
      url:   group.course.getUrl(),
      title: 'Описание курса'
    }, {
      url:   `/courses/groups/${group.slug}/info`,
      title: 'Инструкции по настройке окружения'
    }, {
      url:   `/jb`,
      title: 'Скидка на редакторы Jetbrains'
    }];

    if (groups[i].materials) {
      groupInfo.links.push({
        url:   `/courses/groups/${group.slug}/materials`,
        title: 'Материалы для обучения'
      });
    }

    groupInfo.status = (groupInfo.dateStart > new Date()) ? 'accepted' :
      (groupInfo.dateEnd > new Date()) ? 'started' : 'ended';


    if (groupInfo.status == 'ended') {
      groupInfo.certificateLink = `/courses/download/participant/${participant._id}/certificate.jpg`;
    }
    groupInfoItems.push(groupInfo);

  }

  // plus groups where teaches
  var groupsWhereTeacher = yield CourseGroup.find({
    teacher: user._id,
    dateEnd: {
      // show 2 weeks after the end, not more
      $not: {
        $lt:  new Date(+new Date() - 14*86400*1e3)
      }
    }
  });

  for (let i = 0; i < groupsWhereTeacher.length; i++) {
    let group = groupsWhereTeacher[i];
    yield CourseGroup.populate(group, {path: 'course'});

    let groupInfo = formatGroup(group);

    groupInfo.isTeacher = true;

    groupInfo.links = [{
      url:   group.course.getUrl(),
      title: 'Описание курса'
    }, {
      url:   `/courses/groups/${group.slug}/info`,
      title: 'Инструкции по настройке окружения'
    }, {
      url:   `/courses/groups/${group.slug}/materials`,
      title: 'Материалы для обучения'
    }];

    groupInfo.status = (groupInfo.dateStart > new Date()) ? 'accepted' :
      (groupInfo.dateEnd > new Date()) ? 'started' : 'ended';

    groupInfoItems.push(groupInfo);
  }

  this.body = groupInfoItems;

};


function formatGroup(group) {
  return {
    title:     group.title,
    dateStart: group.dateStart,
    dateEnd:   group.dateEnd,
    timeDesc:  group.timeDesc
  };
}
