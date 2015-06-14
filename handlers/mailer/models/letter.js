const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  sent: {
    type: Boolean,
    required: true,
    index: true,
    default: false
  },
  created: {
    type: Date,
    index: true,
    default: Date.now
  },

  // add a label to search through db for sent messages
  // e.g can send letters for the same label to those who didn't receive it
  label: String,

  // or you can label with objectId
  // e.g NewsletterRelease
  labelId: Schema.Types.ObjectId,

  message: {},

  // Transport responds with that
  transportResponse: {}
});

schema.index({ 'message.to': 1 });
var Letter = module.exports = mongoose.model('Letter', schema);
