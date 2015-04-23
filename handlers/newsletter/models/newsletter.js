const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  // weight for non-internal subscriptions sorting
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  // how often? string description
  period: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

var Newsletter = module.exports = mongoose.model('Newsletter', schema);
