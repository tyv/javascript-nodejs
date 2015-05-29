const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const _ = require('lodash');
const Subscription = require('./subscription');

const schema = new Schema({
  action: {
    type: String,
    enum: ['add', 'remove', 'replace'],
    required: true
  },

  applied: {
    type: Boolean
  },

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
    required: true,
    default: function() {
      return parseInt(crypto.randomBytes(6).toString('hex'), 16).toString(36);
    }
  },
  created:     {
    type:    Date,
    default: Date.now
  }
});

schema.methods.apply = function*() {

  var subscription = yield Subscription.findOne({
    email: this.email
  });

  if (this.newsletters.length && this.newsletters[0]._id) {
    throw new Error("Newsletters must not be populated");
  }

  if (this.action == 'remove') {
    if (subscription) {
      yield subscription.remove();
    }
    this.applied = true;
    return;
  }

  if (!subscription) {
    subscription = new Subscription({
      email:       this.email
    });
  }

  if (this.action == 'add') {

    this.newsletters.forEach(function(id) {
      subscription.newsletters.addToSet(id);
    }, this);

    yield subscription.persist();

  }

  if (this.action == 'replace') {
    subscription.newsletters = this.newsletters;
    yield subscription.persist();
  }

  this.applied = true;
  return subscription;
};

var SubscriptionAction = module.exports = mongoose.model('SubscriptionAction', schema);
