var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CourseGroup = require('./courseGroup');

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

  // short description to show in the list
  shortDescription: {
    type: String
  },

  videoKeyTag: {
    // may be 2 adjacent courses have same video tag
    type: String
  },

  weight: {
    type: Number,
    required: true
  },

  // is this course in the open course list (otherwise hidden)?
  // even if not, the course is accessible by a direct link
  isListed: {
    type: Boolean,
    required: true,
    default: false
  },


  created: {
    type:    Date,
    default: Date.now
  }
});


schema.methods.getUrl = function() {
  return '/courses/' + this.slug;
};

schema.methods.hasOpenGroups = function*() {
  var anyGroup = CourseGroup.findOne({
    isOpenForSignup: true,
    isListed: true,
    course: this._id
  }).exec();

  return Boolean(anyGroup);
};

module.exports = mongoose.model('Course', schema);

