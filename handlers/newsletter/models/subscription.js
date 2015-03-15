const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const schema = new Schema({
  newsletter:        {
    type: Schema.Types.ObjectId,
    ref:  'Newsletter',
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: [
      {
        validator: function checkEmail(value) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg:       'Укажите, пожалуйста, корретный email.'
      }
    ]
  },
  accessKey: {
    type:     String,
    index: true,
    default: function() {
      return parseInt(crypto.randomBytes(5).toString('hex'), 16).toString(36);
    }
  },
  confirmed: {
    type: Boolean,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.index({newsletter: 1, email: 1}, {unique: true});

var Subscription = module.exports = mongoose.model('Subscription', schema);