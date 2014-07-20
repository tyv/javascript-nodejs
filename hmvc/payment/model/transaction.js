var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

/**
 * Transaction is an actual payment for something
 * Order may exist without any transactions (pay later)
 * Transaction has it's own separate number (payment attempt)
 * @type {Schema}
 */
var schema = new Schema({
  order:       {
    type: Schema.Types.ObjectId,
    ref:  'Order'
  },
  amount:      {
    type:     Number,
    required: true
  },
  paymentType: {
    type:     String,
    required: true
  },
  created:     {
    type:    Date,
    default: Date.now
  },
  status:      {
    type: String
  },
  data:        String
});

schema.plugin(autoIncrement.plugin, {model: 'Transaction', field: 'number'});


const Transaction = mongoose.model('Transaction', schema);

Transaction.STATUS_SUCCESS = 'success';
Transaction.STATUS_FAIL = 'fail';


