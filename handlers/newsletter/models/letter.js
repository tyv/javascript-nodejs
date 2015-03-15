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

  sent: {
    type: Boolean,
    required: true,
    default: false
  },
  packCreated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  data: {}
});

var Letter = module.exports = mongoose.model('Letter', schema);