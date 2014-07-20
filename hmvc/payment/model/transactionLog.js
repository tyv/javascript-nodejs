var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({

  transaction: {
    type: Schema.Types.ObjectId,
    ref:  'Transaction'
  },
  event: String,
  data: String,

  created:  {
    type:    Date,
    default: Date.now
  }
});

mongoose.model('TransactionLog', schema);

