var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('config');
var fs = require('mz/fs');
var path = require('path');
var log = require('log')();

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
    courseName: { // how to call this user in-course?
      type: String,
      required: true
    },
    videoKey: {
      type: String
      // there may be groups without video & keys
    }
  }],

  // room jid AND gotowebinar id
  // an offline group may not have this
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

schema.methods.readMaterials = function*() {
  var groupDir = path.join(config.courseRoot, this.slug);


  try {
    var files = yield fs.readdir(groupDir);
    return files.map(function(file) {
      if (file[0] == '.') return null;
      return {
        path: path.join(groupDir, file),
        url: `/courses/groups/${this.slug}/download/${file}`,
        title: file
      };
    }).filter(Boolean);
  } catch (e) {
    log.error("Group dir must be a directory", groupDir);

    return [];
  }

};

schema.methods.decreaseParticipantsLimit = function(count) {
  count = count === undefined ? 1 : count;
  this.participantsLimit -= count;
  if (this.participantsLimit < 0) this.participantsLimit = 0;
  if (this.participantsLimit === 0) {
    this.isOpenForSignup = false; // we're full!
  }
};

module.exports = mongoose.model('CourseGroup', schema);

