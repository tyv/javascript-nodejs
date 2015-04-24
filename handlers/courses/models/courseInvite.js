var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// the schema follows http://openexchangerates.org/api/latest.json response
var schema = new Schema({

  group: {
    type: Schema.Types.ObjectId,
    ref:  'CourseGroup',
    required: true
  },

  token: {
    type: String,
    required: true,
    default: function() {
      return Math.random().toString(36).slice(2, 10);
    }
  },

  email: {
    type: String,
    required: true
  },

  accepted: {
    type: Boolean,
    required: true,
    default: false
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


module.exports = mongoose.model('CourseInvite', schema);

