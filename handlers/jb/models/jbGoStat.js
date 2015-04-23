const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  ip: {
    type: String
  },
  referer: {
    type: String
  },
  cookie: {
    type: String
  },

  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JbGoStat', schema);
