const Order = require('payments').Order;
const assert = require('assert');
const path = require('path');
const log = require('log')();
const config = require('config');
const sendMail = require('mailer').send;
const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');
const createOrderInvites = require('./createOrderInvites');
const xmppClient = require('xmppClient');
const VideoKey = require('videoKey').VideoKey;
const sendInvite = require('./sendInvite');

// not a middleware
// can be called from CRON
module.exports = function* (order) {

  yield Order.populate(order, {path: 'user'});

  var group = yield CourseGroup.findById(order.data.group).exec();

  var emails = order.data.emails;

  // order.user is the only one registered person, we know all about him
  var orderUserIsParticipant = ~emails.indexOf(order.user.email);

  // is there anyone except the user?
  var orderHasParticipantsExceptUser = emails.length > 1 || emails[0] != order.user.email;


  log.debug("orderUserIsParticipant:", orderUserIsParticipant, "orderHasParticipantsExceptUser:", orderHasParticipantsExceptUser);

  var invites = yield* createOrderInvites(order);

  var orderUserInvite;
  // send current user's invite in payment confirmation letter
  if (orderUserIsParticipant) {
    // probably generated above, but maybe(?) not, ensure we get it anyway
    orderUserInvite = yield CourseInvite.findOne({email: order.user.email}).exec();
    assert(orderUserInvite);
    invites = invites.filter(function(invite) {
      return invite.email != order.user.email;
    });
  }

  yield group.persist();

  yield sendMail({
    templatePath: path.join(__dirname, '..', 'templates', 'successEmail'),
    from: 'orders',
    to: order.email,
    orderNumber: order.number,
    subject: "Подтверждение оплаты за курс, заказ " + order.number,
    orderUserInviteLink: config.server.siteHost + '/courses/invite/' + orderUserInvite.token,
    orderUserIsParticipant: orderUserIsParticipant,
    orderHasOtherParticipants: orderHasParticipantsExceptUser
  });

  // send invites in parallel, for speed
  yield invites.map(function(invite) {
    return sendInvite(invite);
  });

/*
  yield CourseGroup.populate(group,[{path: 'participants.user'}, {path: 'course'}]);

  if (process.env.NODE_ENV != 'development') {
    yield* grantXmppChatMemberships(group);
  }

  if (group.course.videoKeyTag) {
    yield *grantVideoKeys(group);
  }
*/

  order.status = Order.STATUS_SUCCESS;

  yield order.persist();

  log.debug("Order success: " + order.number);
};


function* grantXmppChatMemberships(group) {
  log.debug("Grant xmpp chat membership");
  // grant membership in chat
  var client = new xmppClient({
    jid:      config.xmpp.admin.login + '/host',
    password: config.xmpp.admin.password
  });

  yield client.connect();

  var roomJid = yield client.createRoom({
    roomName:    group.webinarId,
    membersOnly: 1
  });


  var jobs = [];
  for (var i = 0; i < group.participants.length; i++) {
    var participant = group.participants[i];

    log.debug("grant " + roomJid + " to", participant.user.profileName, participant.firstName, participant.surname);

    jobs.push(client.grantMember(roomJid, participant.user.profileName,  participant.firstName + ' ' + participant.surname));
  }

  // grant all in parallel
  yield jobs;

  client.disconnect();
}

function* grantVideoKeys(group) {

  var participants = group.participants.filter(function(participant) {
    return !participant.videoKey;
  });

  console.log(group.participants, participants);
  var videoKeys = yield VideoKey.find({
    tag: group.course.videoKeyTag,
    used: false
  }).limit(participants.length).exec();

  log.debug("Keys selected", videoKeys && videoKeys.toArray());

  if (!videoKeys || videoKeys.length != participants.length) {
    throw new Error("Недостаточно серийных номеров " + participants.length);
  }

  for (var i = 0; i < participants.length; i++) {
    var participant = participants[i];
    participant.videoKey = videoKeys[i].key;
    videoKeys[i].used = true;
  }

  yield group.persist();

  var jobs = videoKeys.map(function(videoKey) {
    return videoKey.persist();
  });
  yield jobs;
}
