"use strict";

const CourseGroup = require('../models/courseGroup');
const _ = require('lodash');
const sendOrderInvites = require('./sendOrderInvites');
const Order = require('payments').Order;

// called by payments/common/order
module.exports = function*() {

  var group = yield CourseGroup.findById(this.order.data.group).populate('participants.user').exec();

  var groupParticipantsByEmail = _.indexBy(group.participants, function(participant) {
    return participant.user.email;
  });

  if ("emails" in this.request.body) {

    let emails = _.unique(this.request.body.emails.split(',').filter(Boolean));

    this.log.debug("Incoming emails", emails);

    emails = emails.filter(function throwAwayParticipantsInSubmitted(email) {
      return !(email in groupParticipantsByEmail);
    });

    this.log.debug("Incoming emails except participants", emails);

    var newEmails = this.order.data.emails.filter(function keepParticipantsInOrder(email) {
      return email in groupParticipantsByEmail;
    });

    this.log.debug("Order participant emails", newEmails);

    newEmails = newEmails.concat(emails);

    this.log.debug("Order new emails", newEmails);

    if (newEmails.length > this.order.data.count) {
      this.throw(400, "Too many emails.");
    }

    this.order.data.emails = newEmails;
  }

  if ("contactName" in this.request.body) {
    this.order.data.contactName = this.request.body.contactName;
  }

  if ("contactPhone" in this.request.body) {
    this.order.data.contactPhone = this.request.body.contactPhone;
  }

  this.order.markModified('data');
  yield this.order.persist();


  var invites = [];
  if (this.order.status == Order.STATUS_SUCCESS) {
    invites = yield* sendOrderInvites(this.order);
  }

  if (invites.length) {
    let emails =  _.pluck(invites, 'email');
    this.body = 'Информация обновлена, приглашения высланы на адреса: ' + emails.join(", ") + '.';
  } else {
    this.body = 'Информация об участниках обновлена.';
  }
};

