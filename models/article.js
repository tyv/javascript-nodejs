var mongoose = require('lib/mongoose');
var troop = require('mongoose-troop');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var schema = new Schema({
  title: {
    type:     String,
    required: true
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

  parent: {
    type:  ObjectId,
    ref:   'Article',
    index: true
  },

  weight: {
    type:     Number,
    required: true
  }

});

schema.pre('remove', function (next) {
  const Reference = mongoose.models.Reference;
  Reference.remove({article: this._id}, next);
});

schema.plugin(troop.timestamp);

mongoose.model('Article', schema);


