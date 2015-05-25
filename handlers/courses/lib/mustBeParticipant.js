var _ = require('lodash');

module.exports = function*(next) {

  var group = this.groupBySlug;

  if (!this.user) {
    this.throw(401);
  }

  var participantIds = _.pluck(group.participants, 'user').map(String);
  if (!~participantIds.indexOf(String(this.user._id))) {
    this.throw(403, "Вы не являетесь участником этой группы. Возможно, нужно авторизоваться?");
  }

  yield* next;
};
