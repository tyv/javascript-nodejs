const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const _ = require('lodash');

const schema = new Schema({
  newsletters: {
    // can be empty
    type:     [{
      type: Schema.Types.ObjectId,
      ref:  'Newsletter'
    }],
    default: [],
    validate: [
      {
        validator: function mustBeUnique(value) {
          return _.uniq(value).length == value.length;
        },
        msg:       'Список подписок содержит дубликаты.'
      }
    ]
  },
  email:       {
    type:     String,
    required: true,
    unique:   true,
    validate: [
      {
        validator: function checkEmail(value) {
          return /^[-.\w+]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg:       'Укажите, пожалуйста, корректный email.'
      }
    ]
  },
  accessKey:   {
    type:    String,
    unique:  true,
    default: function() {
      return parseInt(crypto.randomBytes(6).toString('hex'), 16).toString(36);
    }
  },
  confirmed:   {
    type:     Boolean,
    required: true
  },
  created:     {
    type:    Date,
    default: Date.now
  }
});

var Subscription = module.exports = mongoose.model('Subscription', schema);
