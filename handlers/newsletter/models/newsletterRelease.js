const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Letter = require('mailer').Letter;

// выпуск рассылки
const schema = new Schema({
  newsletter:        {
    type: Schema.Types.ObjectId,
    ref:  'Newsletter',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsletterRelease', schema);