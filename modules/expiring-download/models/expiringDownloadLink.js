var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// files use /files/ dir
var schema = new Schema({
  // use _id as unique token

  // path from /files/
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

module.exports = mongoose.model('ExpiringDownloadLink', schema);

