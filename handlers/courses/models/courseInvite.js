var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

  // invite page visited
  // -> check order if the person is in the list (not removed)
  // -> add to participants and accept
  // invite belongs to the order, not group,
  // so we can check it agains order actual participants
  order: {
    type: Schema.Types.ObjectId,
    ref:  'Order'
    // not required, invite may exist without an order ("free second time" for people who had problems)
  },

  // when order is null,
  // this field is the only way to get the group to join
  group: {
    type: Schema.Types.ObjectId,
    ref:  'CourseGroup',
    required: true
  },

  token: {
    type: String,
    required: true,
    default: function() {
      return Math.random().toString(36).slice(2, 10);
    }
  },

  email: {
    type: String,
    required: true
  },

  accepted: {
    type: Boolean,
    required: true,
    default: false
  },

  validUntil: {
    type: Date,
    required: true
    // invite is also a login token, so limit it
    // max(group + 7 days, created + 7 days)
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


schema.methods.accept = function*() {
  yield this.persist({
    accepted: true
  });
};

module.exports = mongoose.model('CourseInvite', schema);

