var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// the schema follows http://openexchangerates.org/api/latest.json response
var schema = new Schema({
  // 01.01.2015
  dateStart: {
    type:     Date,
    required: true
  },
  // 05.05.2015
  dateEnd:   {
    type:     Date,
    required: true
  },

  // like "nodejs-0402", for urls
  slug: {
    type:     String,
    required: true,
    unique:   true
  },

  price: {
    type:     Number,
    required: true
  },

  // Every mon and thu at 19:00 GMT+3
  timeDesc: {
    type:     String,
    required: true
  },

  // currently available places
  // decrease onPaid
  participantsLimit: {
    type:     Number,
    required: true
  },

  // is this group in the open course list (otherwise hidden)?
  // even if not, the group is accessible by a direct link
  isListed: {
    type: Boolean,
    required: true,
    default: false
  },

  // is it possible to register?
  isOpenForSignup: {
    type: Boolean,
    required: true,
    default: false
  },

  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref:  'User',
      index: true,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    videoKey: {
      type: String
      // not required
    }
  }],

  // room jid, gotowebinar id
  webinarId: {
    type: String
  },

  course:       {
    type:     Schema.Types.ObjectId,
    ref:      'Course',
    required: true
  },

  // JS/UI 10.01
  // a user-friendly group title
  title: {
    type:     String,
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

