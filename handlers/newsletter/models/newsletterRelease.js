const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Letter = require('mailer').Letter;

// keeps all important features for a letter release
// can use it to send more to the same newsleters subscribers (when they appear)
const schema = new Schema({
  newsletters:       {
    type:     [{
      type: Schema.Types.ObjectId,
      ref:  'Newsletter'
    }],
    required: true
  },
  newslettersExcept: {
    type: [{
      type: Schema.Types.ObjectId,
      ref:  'Newsletter'
    }]
  },
  created:           {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsletterRelease', schema);
