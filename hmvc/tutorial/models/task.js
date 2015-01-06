var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const html2search = require('search').html2search;

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
    // can be empty (assuming there is a solution.view which will be autolinked)
    type:     String,
    default: ""
  },

  rendered: {
    type: {}
  },

  search: String,
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

schema.pre('save', function(next) {
  if (!this.rendered) return next();

  var searchContent = this.rendered.content;

  var searchSolution = Array.isArray(this.rendered.solution) ? this.rendered.solution.map(function(part) {
    return part.title + "\n" + part.content;
  }).reduce(function(prev, current) {
    return prev + "\n" + current;
  }, '') : this.rendered.solution;

  this.search = html2search(searchContent + "\n\n" + searchSolution);
  next();
});

schema.plugin(troop.timestamp);

module.exports = mongoose.model('Task', schema);


