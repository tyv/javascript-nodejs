const mongoose = require('mongoose');
const troop = require('mongoose-troop');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const Reference = require('./reference');

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
  },

  isFolder: {
    type:     Boolean,
    required: true
  }

});

// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicRoot, 'article');

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

/**
 * Returns {children: [whole article tree]} with nested children
 * @returns {{children: Array}}
 */
schema.statics.findTree = function* () {
  const Article = this;
  var articles = yield Article.find({}).sort({weight: 1}).select('parent slug title weight isFolder').lean().exec();

  // arrange by ids
  var articlesById = {};
  for (var i=0; i<articles.length; i++) {
    var article = articles[i];
    article._id = article._id.toString();
    articlesById[article._id] = article;
  }

  var root = [];

  addChildren();

  addPrevNext();

  return {
    children: root,
    byId: function(id) {
      if (!id) return undefined;
      return articlesById[id.toString()];
    }
  };

  // ---

  function addChildren() {

    for (var _id in articlesById) {
      var article = articlesById[_id];
      if (article.parent) {
        var parent = articlesById[article.parent];
        if (!parent.children) parent.children = [];
        parent.children.push(article);
      } else {
        root.push(article);
      }
    }

  }

  function addPrevNext() {

    var prev;
    var next;

    addPrev(root);
    addNext();

    function addPrev(children) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (prev) child.prev = prev;
        prev = child._id;
        if (child.children) {
          addPrev(child.children);
        }
      }
    }

    function addNext() {
      for (var _id in articlesById) {
        var article = articlesById[_id];
        if (article.prev) {
          articlesById[article.prev].next = _id;
        }
      }
    }
  }

};

schema.pre('remove', function(next) {
  // require it here to be sure that Reference model actually exists ?
  Reference.remove({article: this._id}, next);
});

schema.plugin(troop.timestamp);

module.exports = mongoose.model('Article', schema);

