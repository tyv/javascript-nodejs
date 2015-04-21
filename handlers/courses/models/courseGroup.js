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

  // like "nodejs-0402", for urls
  slug: {
    type: String,
    required: true,
    unique: true
  },

  price: {
    type: Number,
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

  course:{
    type: Schema.Types.ObjectId,
    ref:  'Course',
    required: true
  },

  // JS/UI 10.01
  // a user-friendly group title
  title: {
    type: String,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


schema.methods.getUrl = function() {
  return '/courses/groups/' + this.slug;
};


module.exports = mongoose.model('CourseGroup', schema);

