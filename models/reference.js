var mongoose = require('lib/mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var schema = new Schema({
  article: {
    type:     ObjectId,
    ref:      'Article',
    index:    true,
    required: true
  },

  anchor: {
    type:     String,
    index:    true,
    unique:   true,
    required: true
  }
});


mongoose.model('Reference', schema);


