var registerParticipants = require('../lib/registerParticipants');

exports.get = function*() {

  this.nocache();

  yield* registerParticipants(this.groupBySlug);
  this.body = "OK " + this.requestId;

};
