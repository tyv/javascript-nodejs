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
    let group = formatGroup(invites[i].group);
    group.inviteToken = invites[i].token;
    this.body.push(group);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    this.body.push(formatGroup(group));
  }

};

function formatGroup(group) {
  return {
    title: group.title,
    groupUrl: group.getUrl(),
    groupPrivateUrl: group.getPrivateUrl(),
    dateStart: group.dateStart,
    dateEnd: group.dateEnd,
    timeDesc: group.timeDesc
  };
}
