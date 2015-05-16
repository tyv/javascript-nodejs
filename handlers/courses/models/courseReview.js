var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var countries = require('countries');

var schema = new Schema({

  courseGroup: {
    type: Schema.Types.ObjectId,
    ref:  'CourseGroup',
    required: true
  },

  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  content: {
    type: String,
    required: true
  },

  // copy from participants
  participantName: {
    type: String,
    required: true
  },

  // for selected reviews, to show at the courses main, cut them at this point
  // todo: add an intellectual cutting function like jQuery dotdotdot, but w/o jquery
  cutAtLength: {
    type: Number
  },

  // copy from avatar if exists
  photoLink: {
    type: String
  },

  country: {
    type: String,
    enum: Object.keys(countries.all),
    required: true
  },

  city: {
    type: String
  },

  isPublic: {
    type: Boolean,
    required: true
  },

  profileLink: {
    type: String
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


module.exports = mongoose.model('CourseReview', schema);

