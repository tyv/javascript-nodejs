var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var OrderTemplate = require('./orderTemplate');
var Transaction = require('./transaction');
var _ = require('lodash');

var schema = new Schema({
  amount:      {
    type:     Number,
    required: true
  },
  module:      { // module so that transaction handler knows where to go back e.g. 'ebook'
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
    type:    String,
    enum:    ['success', 'cancel', 'pending', 'paid'],
    default: 'pending'
  },

  // order can be bound to either an email or a user
  email: {
    type: String
  },
  user:  {
    type: Schema.Types.ObjectId,
    ref:  'User'
  },

  data: {
    type:    Schema.Types.Mixed,
    default: {}
  },

  created:  {
    type:    Date,
    default: Date.now
  },
  modified: {
    type: Date
  }

});

schema.pre('save', function(next) {
  this.modified = new Date();
  next();
});

// order must have only 1 pending transaction at 1 time.
// finish one payment then create another
// UI does not allow to create multiple pending transaction
//  that's to easily find/cancel a pending method
// Here I guard against hand-made POST requests (just to be sure)
// P.S. it is ok to create a transaction if a SUCCESS one exists (maybe split payment?)
schema.methods.cancelPendingTransactions = function*() {

  yield Transaction.findOneAndUpdate({
    order:  this._id,
    status: Transaction.STATUS_PENDING
  }, {
    status:        Transaction.STATUS_FAIL,
    statusMessage: "смена способа оплаты."
  }).exec();

};

schema.methods.onPaid = function*() {
  this.persist({
    status: Order.STATUS_PAID
  });
  yield* require(this.module).onPaid(this);
};

schema.plugin(autoIncrement.plugin, {model: 'Order', field: 'number', startAt: 1});

// order is ready for delivery, hooks finished
schema.statics.STATUS_SUCCESS = 'success';

// payment received, but the order hooks did not finish yet
schema.statics.STATUS_PAID = 'paid';

// awaiting payment
schema.statics.STATUS_PENDING = 'pending';

// not awaiting payment any more
schema.statics.STATUS_CANCEL = 'cancel';

schema.methods.getUrl = function() {
  return '/' + this.module + '/orders/' + this.number;
};

var Order = module.exports = mongoose.model('Order', schema);

