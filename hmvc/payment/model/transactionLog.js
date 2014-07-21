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

/* jshint -W003 */
var TransactionLog = mongoose.model('TransactionLog', schema);

