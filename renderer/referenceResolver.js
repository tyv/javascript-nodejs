const util = require('util');
const TreeWalker = require('javascript-parser').TreeWalker;
const ReferenceNode = require('javascript-parser').ReferenceNode;
const CompositeTag = require('javascript-parser').CompositeTag;
const TextNode = require('javascript-parser').TextNode;
const ErrorTag = require('javascript-parser').ErrorTag;
const mongoose = require('lib/mongoose');
const Reference = mongoose.models.Reference;
const Article = mongoose.models.Article;
const Task = mongoose.models.Task;

function ReferenceResolver(root) {
  this.root = root;
}


ReferenceResolver.prototype.run = function* () {

  var treeWalker = new TreeWalker(this.root);

  var self = this;
  yield treeWalker.walk(function*(node) {
    if (!(node instanceof ReferenceNode)) return;

    // need
    const referenceObj = yield self.resolve(node.ref);

    if (!referenceObj) {
      return new ErrorTag('span', 'No such reference: ' + node.ref);
    }

    var newNode = new CompositeTag('a', node.getChildren(), {href: referenceObj.url});

    if (newNode.getChildren().length === 0) {
      if (node.ref[0] == '#') {
        newNode.appendChild(new TextNode(node.ref.slice(1)));
      } else {
        newNode.appendChild(new TextNode(referenceObj.title));
      }
    }

    return newNode;

  });
};

ReferenceResolver.prototype.resolve = function* (value) {
  if (value[0] == '#') {
    var ref = yield Reference.findOne({anchor: value.slice(1)}).populate('article', 'slug title').exec();
    return ref && { title: ref.article.title, url: ref.getUrl() };
  }

  if (value.indexOf('/task/') === 0) {
    var task = yield Task.findOne({slug: value.slice('/task/'.length)}, 'slug title').exec();
    return task && {title: task.title, url: task.getUrl()};
  }

  var article = yield Article.findOne({slug: value.slice(1)}, 'slug title').exec();
  return article && {title: article.title, url: article.getUrl()};
};

exports.ReferenceResolver = ReferenceResolver;