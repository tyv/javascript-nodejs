var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// references can be only in articles
// [...](/my-url) is not a reference
// [...](#anchor) *is* a reference
// when no title, reference content is used: [](#anchor) -> <a href="...">anchor</a>
var schema = new Schema({

  article: {
    type: Schema.Types.ObjectId,
    ref:  'Article'
  },

  anchor: {
    type:     String,
    index:    true,
    unique:   true,
    required: true
  }

});

schema.methods.getUrl = function() {
  return this.article.getUrl() + '#' + this.anchor;
};

mongoose.model('Reference', schema);
