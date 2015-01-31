var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  from:    {
    type:     String,
    required: true,
    index: true
  },
  to:    {
    type:     String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true
  },
  created: {
    type:    Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('CurrencyRate', schema);

