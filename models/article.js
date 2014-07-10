const mongoose = require('lib/mongoose');
const troop = require('mongoose-troop');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const Reference = mongoose.models.Reference;

const schema = new Schema({
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

// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicPath, 'article');

schema.statics.getResourceFsRootBySlug = function(slug) {
  return path.join(schema.statics.resourceFsRoot, slug);
};

schema.statics.getResourceWebRootBySlug = function(slug) {
  return '/article/' + slug;
};

schema.statics.getUrlBySlug = function(slug) {
  return '/' + slug;
};

schema.methods.getResourceFsRoot = function() {
  return schema.statics.getResourceFsRootBySlug(this.get('slug'));
};

schema.methods.getResourceWebRoot = function() {
  return schema.statics.getResourceWebRootBySlug(this.get('slug'));
};

schema.methods.getUrl = function() {
  return schema.statics.getUrlBySlug(this.get('slug'));
};

schema.pre('remove', function (next) {
  Reference.remove({article: this._id}, next);
});

schema.plugin(troop.timestamp);

mongoose.model('Article', schema);


