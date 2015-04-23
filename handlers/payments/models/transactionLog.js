var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

  transaction: {
    type: Schema.Types.ObjectId,
    ref:  'Transaction',
    index: true
  },
  event: {
    type: String,
    index: true
  },
  data: Schema.Types.Mixed,

  created:  {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TransactionLog', schema);

