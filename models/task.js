var mongoose = require('lib/mongoose');
var troop = require('mongoose-troop');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var schema = new Schema({
  title: {
    type:     String,
    required: true
  },

  importance: {
    type: Number
  },

  slug: {
    type:     String,
    unique:   true,
    required: true,
    index:    true
  },

  content: {
    type:     String,
    required: true
  },

  solution: {
    type:     String,
    required: true
  },

  parent: {
    type:     ObjectId,
    ref:      'Article',
    required: true,
    index:    true
  }
});

schema.plugin(troop.timestamp);

mongoose.model('Task', schema);


