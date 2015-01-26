const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type:     String,
    unique:   true,
    required: true,
    index:    true
  }
});


// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicRoot, 'quiz');

schema.statics.getResourceFsRootBySlug = function(slug) {
  return path.join(schema.statics.resourceFsRoot, slug);
};

schema.statics.getResourceWebRootBySlug = function(slug) {
  return '/quiz/' + slug;
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


module.exports = mongoose.model('Quiz', schema);