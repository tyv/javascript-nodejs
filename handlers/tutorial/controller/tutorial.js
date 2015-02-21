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

  var locals = yield* renderTutorial();

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

  var result = {
    js: treeRendered[0],
    ui: treeRendered[1],
    more: treeRendered[2]
  };

  // render top-level content
  for (var key in result) {
    var child = result[key];
    yield* populateContent(child);
  }

  // and render 1 level down inside result.more content
  for (var i = 0; i < result.more.children.length; i++) {
    var child = result.more.children[i];
    yield* populateContent(child);
  }

  return result;

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
