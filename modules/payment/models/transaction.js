var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var Order = require('./order');
var TransactionLog = require('./transactionLog');

/**
 * Transaction is an actual payment for something
 * Order may exist without any transactions (pay later)
 * Transaction has it's own separate number (payment attempt)
 * @type {Schema}
 */
var schema = new Schema({
  order:         {
    type: Schema.Types.ObjectId,
    ref:  'Order'
  },
  amount:        {
    type:     Number,
    required: true
  },
  module:   {
    type:     String,
    required: true
  },
  created:       {
    type:    Date,
    default: Date.now
  },
  status:        {
    type: String
  },
  statusMessage: {
    type: String
  },
  data:          String
});

schema.plugin(autoIncrement.plugin, {model: 'Transaction', field: 'number'});

schema.statics.STATUS_SUCCESS = 'success';
schema.statics.STATUS_FAIL = 'fail';

schema.pre('save', function (next) {
  if (this.status == Transaction.STATUS_SUCCESS) {
    var orderId = this.order._id || this.order;
    Order.findByIdAndUpdate(orderId, {status: Transaction.STATUS_SUCCESS}, next);
  } else {
    next();
  }
});

schema.methods.getStatusDescription = function() {
  if (this.status == Transaction.STATUS_SUCCESS) {
    return 'оплата прошла успешно';
  }

  if (!this.status) {
    return 'нет информации об оплате';
  }

  return 'оплата не прошла';
};

schema.methods.log = function*(options) {
  options.transaction = this._id;
  var log = new TransactionLog(options);
  yield log.persist();
};

/* jshint -W003 */
var Transaction = module.exports = mongoose.model('Transaction', schema);

