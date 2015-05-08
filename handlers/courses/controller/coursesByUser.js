"use strict";

const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');

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
  var groups = yield CourseGroup.find({
    'participants.user': user._id
  }).exec();

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

    let groupInfo = formatGroup(group);
    groupInfo.links = [{
      url: group.course.getUrl(),
      title: 'Описание курса'
    }, {
      url: `/courses/groups/${group.slug}/info`,
      title: 'Инструкции по настройке окружения'
    }];

    var materials = yield groups[i].readMaterials();
    if (materials.length) {
      groupInfo.links.push({
        url: `/courses/groups/${group.slug}/download`,
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
