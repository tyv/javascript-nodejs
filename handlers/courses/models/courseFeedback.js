var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var countries = require('countries');

var schema = new Schema({

  group: {
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

  teacherComment: {
    type: String
  },

  participant: {
    type: Schema.Types.ObjectId,
    ref:  'CourseParticipant',
    required: true
  },

  teacherCache: {
    type: Schema.Types.ObjectId,
    ref:  'User',
    required: true
  },

  userCache: {
    type: Schema.Types.ObjectId,
    ref:  'User',
    required: true
  },

  // todo (not used now)
  // for selected reviews, to show at the courses main, cut them at this point
  // todo: add an intelligent cutting function like jQuery dotdotdot, but w/o jquery
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

schema.plugin(autoIncrement.plugin, {model: 'CourseFeedback', field: 'number', startAt: 1});

module.exports = mongoose.model('CourseFeedback', schema);

