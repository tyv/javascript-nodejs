var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var config = require('config');

// files use /files/ dir
var schema = new Schema({

  linkId:    {
    type:     String,
    default: function() {
      // 6-7 random alphanumeric chars
      return parseInt(crypto.randomBytes(4).toString('hex'), 16).toString(36);
    },
    required: true,
    unique: true
  },

  relativePath:    {
    type:     String,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now,
    expires: '3d' // link must die in 3 days
  }
});

schema.methods.getUrl = function() {
  return config.server.siteHost + '/download/' + this.linkId;
};

module.exports = mongoose.model('ExpiringDownloadLink', schema);

