const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Letter = require('mailer').Letter;

// a letter to one (or more) newsletters
const schema = new Schema({
  newsletters:        {
    type: [{
      type: Schema.Types.ObjectId,
      ref:  'Newsletter'
    }],
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsletterRelease', schema);
