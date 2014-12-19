var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
const config = require('config');
const path = require('path');

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
    // can be empty (assuming there is a solution.view)
    type:     String,
    default: ""
  },

  solutionPlunkId: String,
  sourcePlunkId: String,

  weight: {
    type:     Number,
    required: true
  },

  parent: {
    type:     ObjectId,
    ref:      'Article',
    required: true,
    index:    true
  }
});

// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicRoot, 'task');

schema.statics.getResourceFsRootBySlug = function(slug) {
  return path.join(schema.statics.resourceFsRoot, slug);
};

schema.statics.getResourceWebRootBySlug = function(slug) {
  return '/task/' + slug;
};

schema.statics.getUrlBySlug = function(slug) {
  return '/task/' + slug;
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


schema.plugin(troop.timestamp);

module.exports = mongoose.model('Task', schema);


