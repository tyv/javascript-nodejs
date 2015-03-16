const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// рассылка, общая информация о рассылке
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
  created: {
    type: Date,
    default: Date.now
  }
});

var Newsletter = module.exports = mongoose.model('Newsletter', schema);