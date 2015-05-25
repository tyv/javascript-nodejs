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


  // for complex objects -> prior to logging make them simple (must be jsonable)
  // e.g for HTTP response (HTTP.IncomingMessage)
  // object keys may not contain "." in mongodb, so I may not store arbitrary objects
  // only json can help
  json: String,

  created:  {
    type:    Date,
    default: Date.now
  }
});


schema.virtual('data').get(function() {
  return this.json ? JSON.parse(this.json) : {};
});

schema.virtual('data').set(function(data) {
  this.json = JSON.stringify(data);
});

module.exports = mongoose.model('TransactionLog', schema);

