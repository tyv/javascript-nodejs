var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

  transaction: {
    type: Schema.Types.ObjectId,
    ref:  'Transaction'
  },
  event: String,
  data: Schema.Types.Mixed,

  created:  {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TransactionLog', schema);

