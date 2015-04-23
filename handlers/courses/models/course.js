var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// the schema follows http://openexchangerates.org/api/latest.json response
var schema = new Schema({
  // like "nodejs", same as template
  slug: {
    type: String,
    unique: true,
    required: true
  },

  // "Курс JavaScript/DOM/интерфейсы"
  title: {
    type: String,
    required: true
  },

  weight: {
    type: Number,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


schema.methods.getUrl = function() {
  return '/courses/' + this.slug;
};

module.exports = mongoose.model('Course', schema);

