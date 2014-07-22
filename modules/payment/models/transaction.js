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

  var result = 'оплата не прошла';
  if (this.statusMessage) result += ': ' + this.statusMessage;
  return result;
};

schema.methods.log = function*(options) {
  options.transaction = this._id;

  // for complex objects -> prior to logging make them simple (must be jsonable)
  // e.g for HTTP response (HTTP.IncomingMessage)
  if (options.data && typeof options.data == 'object') {
    // object keys may not contain "." in mongodb, so I may not store arbitrary objects
    // only json can help
    options.data = JSON.stringify(options.data);
  }

  console.log(options);

  var log = new TransactionLog(options);
  yield log.persist();
};

/* jshint -W003 */
var Transaction = module.exports = mongoose.model('Transaction', schema);

