var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var OrderTemplate = require('./orderTemplate');
var _ = require('lodash');

var schema = new Schema({
  amount:      {
    type:     Number,
    required: true
  },
  module:      { // module so that transaction handler knows where to go back e.g. 'getpdf'
    type:     String,
    required: true
  },
  title:       {
    type:     String,
    required: true
  },
  description: {
    type: String
  },
  status:      {
    type: String,
    enum: ['success', 'cancel', 'pending'],
    default: 'pending'
  },

  // order can be bound to either an email or a user
  email:       {
    type: String
  },
  user:        {
    type: Schema.Types.ObjectId,
    ref:  'User'
  },

  data:      {
    type: Schema.Types.Mixed,
    default: {}
  },

  // the url to order this item
  itemUrl: {
    type: String,
    required: true
  },
  created:     {
    type:    Date,
    default: Date.now
  },
  modified:       {
    type:    Date
  }

});

schema.pre('save', function(next){
  this.modified = new Date();
  next();
});

schema.statics.createFromTemplate = function(orderTemplate, body) {
  var Order = this;

  var data = _.assign({
    title:       orderTemplate.title,
    description: orderTemplate.description,
    amount:      orderTemplate.amount,
    data:       orderTemplate.data
  },  body || {});

  return new Order(data);

};

schema.plugin(autoIncrement.plugin, {model: 'Order', field: 'number', startAt: 1});

schema.statics.STATUS_SUCCESS = 'success';

schema.statics.STATUS_PENDING = 'pending';

schema.statics.STATUS_CANCEL = 'cancel';

// maximal time for onsuccess hook to finish
schema.statics.MAX_ONSUCCESS_TIME = 5000;

module.exports = mongoose.model('Order', schema);

