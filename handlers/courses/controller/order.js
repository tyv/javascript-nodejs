var loadOrder = require('payments').loadOrder;
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');

exports.patch = function*() {

  yield* this.loadOrder();

  var group = yield CourseGroup.findById(this.order.data.group).populate('participants.user').exec();

  var groupParticipantsByEmail = _.indexBy(group.participants, function(participant) {
    return participant.user.email;
  });

  if ("emails" in this.request.body) {

    var emails = this.request.body.emails.split(',').filter(Boolean);

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

  this.body = 'OK';
};
