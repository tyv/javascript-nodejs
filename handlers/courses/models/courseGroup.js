var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// the schema follows http://openexchangerates.org/api/latest.json response
var schema = new Schema({
  // 01.01.2015
  dateStart: {
    type: Date,
    required: true
  },
  // 05.05.2015
  dateEnd: {
    type: Date,
    required: true
  },

  // Every mon and thu at 19:00 GMT+3
  timeDesc: {
    type: String,
    required: true
  },

  participantsLimit: {
    type: Number,
    required: true
  },

  /*



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
*/
  created: {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CurrencyRate', schema);

