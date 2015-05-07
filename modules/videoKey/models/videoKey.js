var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  key: {
    type: String,
    unique: true,
    required: true
  },

  tag: {
    type: String,
    required: true
  },

  used: {
    type: Boolean,
    default: false,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now
  }
});

schema.index({used: 1, tag: 1}); // for used=false & tag=XXX queries

module.exports = mongoose.model('VideoKey', schema);

