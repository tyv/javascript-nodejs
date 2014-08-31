const mongoose = require('mongoose');
const Article = require('../models/article');
const ArticleRenderer = require('../renderer/articleRenderer');
const treeUtil = require('lib/treeUtil');
const _ = require('lodash');
const CacheEntry = require('cacheEntry');

exports.get = function *get(next) {

  var renderedArticle = yield CacheEntry.getOrGenerate({
    key:  'article:rendered:' + this.params.slug,
    tags: ['article']
  }, _.partial(renderArticle, this.params.slug));


  if (!renderedArticle) {
    yield next;
    return;
  }

  var locals = {
    title:    renderedArticle.title,
    content:  renderedArticle.body,
    modified: renderedArticle.modified,
    prev:     renderedArticle.prev,
    next:     renderedArticle.next
  };

  var sidebar = {
    sections: []
  };

  var section;
  if (renderedArticle.isFolder) {

    section = {
      title: 'Смежные разделы',
      links: renderedArticle.siblings
    };
    sidebar.sections.push(section);

  } else {
    section = {
      title: 'Навигация по уроку'
    };
    section.links = renderedArticle.metadata.headers
      .filter(function(header) {
        // [level, titleHtml, anchor]
        return header.level == 1;
      }).map(function(header) {
        return {
          title: header.title,
          url:   '#' + header.anchor
        };
      });

  }

  _.assign(this.locals, locals);

  return this.render("article", locals);

};

// body
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
function* renderArticle(slug) {

  var rendered = {};
  const article = yield Article.findOne({ slug: slug }).exec();
  if (!article) {
    return null;
  }

  const renderer = new ArticleRenderer();
  rendered.body = yield renderer.render(article);

  rendered.metadata = renderer.metadata;

  rendered.modified = article.modified;
  rendered.title = article.title;
  rendered.isFolder = article.isFolder;

  const tree = yield Article.findTree();
  const articleInTree = tree.byId(article._id);

  var prev = tree.byId(articleInTree.prev);
  if (prev) {
    rendered.prev = {
      url:   prev.getUrl(),
      title: prev.title
    };
  }

  var next = tree.byId(articleInTree.next);
  if (next) {
    rendered.next = {
      url:   next.getUrl(),
      title: next.title
    };
  }

  var path = [];
  var a = articleInTree;
  while (a) {
    path.push({
      title: a.title,
      url:   a.getUrl()
    });
    a = a.parent;
  }
  rendered.path = path.reverse();

  rendered.siblings = articleInTree.parent.children.map(function(child) {
    return {
      title: child.title,
      url:   child.getUrl()
    };
  });

  return rendered;

}

