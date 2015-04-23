var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// the schema follows http://openexchangerates.org/api/latest.json response
var schema = new Schema({
  timestamp: {
    type: Number,
    required: true,
    unique: true
  },
  base: {
    type: String,
    required: true
  },

  rates: {
    type: Schema.Types.Mixed,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CurrencyRate', schema);

