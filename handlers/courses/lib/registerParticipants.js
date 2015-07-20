const CourseGroup = require('../models/courseGroup');
const log = require('log')();
const CourseParticipant = require('../models/courseParticipant');
const config = require('config');
const XmppClient = require('xmppClient');
const VideoKey = require('videoKey').VideoKey;
const User = require('users').User;
const co = require('co');

module.exports = grantKeysAndChatToGroup;

function* grantKeysAndChatToGroup(group) {
  yield CourseGroup.populate(group, 'course');

  var participants = yield CourseParticipant.find({
    group:    group._id,
    isActive: true
  }).populate('user').exec();

  yield* grantXmppChatMemberships(group, participants);

  if (group.course.videoKeyTag) {
    yield *grantVideoKeys(group, participants);
  }
}


function* grantVideoKeys(group, participants) {

  var participantsWithoutKeys = participants.filter(function(participant) {
    return !participant.videoKey;
  });

  // everyone has the key => exit
  if (!participantsWithoutKeys.length) return;

  var videoKeys = yield VideoKey.find({
    tag: group.course.videoKeyTag,
    used: false
  }).limit(participantsWithoutKeys.length).exec();

  log.debug("Keys selected", videoKeys && videoKeys.toArray());

  if (!videoKeys || videoKeys.length != participantsWithoutKeys.length) {
    throw new Error("Недостаточно серийных номеров " + participantsWithoutKeys.length);
  }

  for (var i = 0; i < participantsWithoutKeys.length; i++) {
    var participant = participantsWithoutKeys[i];
    participant.videoKey = videoKeys[i].key;
    yield participant.persist();
    videoKeys[i].used = true;
    yield videoKeys[i].persist();
  }

}




function* grantXmppChatMemberships(group, participants) {
  log.debug("Grant xmpp chat membership");
  // grant membership in chat
  var client = new XmppClient({
    jid:      config.xmpp.admin.login + '/host',
    password: config.xmpp.admin.password
  });

  yield client.connect();



  var roomJid = yield client.createRoom({
    roomName:    group.webinarId,
    membersOnly: 1
  });

  var jobs = [];
  for (var i = 0; i < participants.length; i++) {
    var participant = participants[i];

    log.debug("grant " + roomJid + " to", participant.user.profileName, participant.firstName, participant.surname);

    jobs.push(client.grantMember(roomJid, participant.user.profileName + '@' + config.xmpp.server,  participant.fullName));
  }

  // grant all in parallel
  yield jobs;

  client.disconnect();
}

// when user updates his details, regrant him, just in case he changed his name
User.post('save', function(user) {
  co(function*() {

    var participants = yield CourseParticipant.find({
      user:    user._id
    }).populate('group').exec();

    var groups = participants.map(function(participant) {
      return participant.group;
    });

    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      yield grantKeysAndChatToGroup(group);
    }


  }).catch(function(err) {
    log.error("Grant error", err);
  });

});
