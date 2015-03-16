const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  sent: {
    type: Boolean,
    required: true,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  data: {},
  // Transport responds with that
  transportResponse: {},
  // SQS notifies of that
  notification: {
    type: {
      delivery: {},
      bounce: {},
      complaint: {}
    }
  }
});

schema.index({ 'data.to': 1 });
schema.index({ 'info.messageId': 1 });
var Letter = module.exports = mongoose.model('Letter', schema);