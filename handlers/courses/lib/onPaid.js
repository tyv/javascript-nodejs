const Order = require('payments').Order;
const path = require('path');
const log = require('log')();
const config = require('config');
const sendMail = require('mailer').send;
const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');
const sendOrderInvites = require('./sendOrderInvites');
const xmppClient = require('xmppClient');
const VideoKey = require('videoKey').VideoKey;

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

  yield sendMail({
    templatePath: path.join(__dirname, '..', 'templates', 'success-email'),
    from: 'orders',
    to: order.email,
    orderNumber: order.number,
    subject: "Подтверждение оплаты за курс, заказ " + order.number,
    orderUserIsParticipant: orderUserIsParticipant,
    orderHasOtherParticipants: orderHasParticipantsExceptUser
  });


  if (orderUserIsParticipant) {
    group.participants.push({
      user: order.user._id,
      courseName: order.data.contactName
    });
    group.participantsLimit--;
  }
  if (group.participantsLimit < 0) group.participantsLimit = 0;
  if (group.participantsLimit === 0) {
    group.isOpenForSignup = false; // we're full!
  }
  yield group.persist();

  yield* sendOrderInvites(order);

  yield CourseGroup.populate(group,[{path: 'participants.user'}, {path: 'course'}]);

  yield* grantXmppChatMemberships(group);

  if (group.course.videoKeyTag) {
    yield *grantVideoKeys(group);
  }


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

    log.debug("grant " + roomJid + " to", participant.user.profileName, participant.courseName);

    jobs.push(client.grantMember(roomJid, participant.user.profileName, participant.courseName));
  }

  // grant all in parallel
  yield jobs;

  client.disconnect();
}

function* grantVideoKeys(group) {

  var participants = group.participants.filter(function(participant) {
    return !participant.videoKey;
  });


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
