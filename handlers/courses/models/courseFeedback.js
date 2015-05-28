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
    required: "Не стоит оценка.",
    min: 1,
    max: 5
  },

  content: {
    type: String,
    required: "Отсутствует текст отзыва."
  },

  participant: {
    type: Schema.Types.ObjectId,
    ref:  'CourseParticipant',
    required: true
  },

  // todo (not used now)
  // for selected reviews, to show at the courses main, cut them at this point
  // todo: add an intellectual cutting function like jQuery dotdotdot, but w/o jquery
  cutAtLength: {
    type: Number
  },

  // copy from avatar if exists
  photo: {
    type: String
  },

  country: {
    type: String,
    enum: Object.keys(countries.all),
    required: "Страна не указана."
  },

  city: {
    type: String
  },

  isPublic: {
    type: Boolean,
    required: true
  },

  recommend: {
    type: Boolean,
    required: true
  },

  aboutLink: {
    type: String
  },

  occupation: {
    type: String
  },

  created: {
    type:    Date,
    default: Date.now
  }
});


module.exports = mongoose.model('CourseFeedback', schema);

