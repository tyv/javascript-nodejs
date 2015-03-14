var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * In other words, "Store items"
 * New orders do *not* reference the items, because store items may change
 * Instead new orders contain full information about themselves.
 *
 * OrderTemplate can be deleted, but the order is self-contained.
 * @type {Schema}
 */
var schema = new Schema({
  title:       {
    type:     String,
    required: true
  },
  description: {
    type: String
  },
  // on checkout /order/slug, the new order is created from this template
  slug:        {
    type:     String,
    required: true,
    unique:   true
  },
  amount:      {
    type:     Number,
    required: true
  },
  created:     {
    type:    Date,
    default: Date.now
  },
  module:      {
    type:     String,
    required: true
  },
  data:        {}
});

module.exports = mongoose.model('OrderTemplate', schema);

