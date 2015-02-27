const mongoose = require('mongoose');
const Article = require('../models/article');
const Task = require('../models/task');
const _ = require('lodash');
const ArticleRenderer = require('../renderer/articleRenderer');

exports.get = function *get(next) {

  this.locals.sitetoolbar = true;
  this.locals.siteToolbarCurrentSection = "tutorial";
  this.locals.title = "Современный учебник JavaScript";
  /*
  var renderedArticle = yield CacheEntry.getOrGenerate({
    key:  'article:rendered:' + this.params.slug,
    tags: ['article']
  }, _.partial(renderArticle, this.params.slug));
*/

  var locals = {
    chapters: yield* renderTutorial()
  };

  this.body = this.render('tutorial', locals);
};

// content
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
function* renderTutorial() {
  const tree = yield* Article.findTree();

  var treeRendered = yield* renderTree(tree);

  // render top-level content
  for (var i = 0; i < treeRendered.length; i++) {
    var child = treeRendered[i];
    yield* populateContent(child);
  }


  return treeRendered;

}


function* renderTree(tree) {
  var children = [];

  for (var i = 0; i < tree.children.length; i++) {
    var child = tree.children[i];

    var childRendered = {
      id: child._id,
      url:   Article.getUrlBySlug(child.slug),
      title: child.title
    };

    if (child.isFolder) {
      childRendered.children = yield* renderTree(child);
    }

    children.push(childRendered);

  }
  return children;
}


function* populateContent(articleObj) {
  var article = yield Article.findById(articleObj.id).exec();

  var renderer = new ArticleRenderer();

  var rendered = yield* renderer.renderWithCache(article);

  articleObj.content = rendered.content;
}
