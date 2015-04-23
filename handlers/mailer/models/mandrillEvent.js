const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },

  // freeform
  // so that any changes in the schema will not affect the store
  payload: {}
});

module.exports = mongoose.model('MandrillEvent', schema);