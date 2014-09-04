const mongoose = require('mongoose');
const Article = require('../models/article');
const ArticleRenderer = require('../renderer/articleRenderer');
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

  console.log(renderedArticle.breadcrumbs);

  var locals = {
    title:      renderedArticle.title,
    body:       renderedArticle.body,
    head:       renderedArticle.head,
    foot:       renderedArticle.foot,
    modified:   renderedArticle.modified,
    prev:       renderedArticle.prev,
    next:       renderedArticle.next,
    breadcrumbs: renderedArticle.breadcrumbs
  };

  var section;
  if (renderedArticle.isFolder) {

    section = {
      title: 'Смежные разделы',
      links: renderedArticle.siblings
    };

  } else {
    section = {
      title: 'Навигация по уроку'
    };

    section.links = renderedArticle.headers
      .filter(function(header) {
        // [level, titleHtml, anchor]
        return header.level == 2;
      }).map(function(header) {
        return {
          title: header.title,
          url:   '#' + header.anchor
        };
      });

  }

  locals.sidebar = {
    sections: [section]
  };

  _.assign(this.locals, locals);

  this.body = this.render("article", locals);

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

  rendered.headers = renderer.metadata.headers;
  rendered.head = renderer.getHead();
  rendered.foot = renderer.getFoot();

  rendered.modified = article.modified;
  rendered.title = article.title;
  rendered.isFolder = article.isFolder;

  const tree = yield Article.findTree();
  const articleInTree = tree.byId(article._id);

  var prev = tree.byId(articleInTree.prev);

  if (prev) {
    rendered.prev = {
      url:   Article.getUrlBySlug(prev.slug),
      title: prev.title
    };
  }

  var next = tree.byId(articleInTree.next);
  if (next) {
    rendered.next = {
      url:   Article.getUrlBySlug(next.slug),
      title: next.title
    };
  }

  var path = [];
  var parent = articleInTree.parent;
  while (parent) {
    var a = tree.byId(parent);
    path.push({
      title: a.title,
      url:   Article.getUrlBySlug(a.slug)
    });
    parent = a.parent;
  }
  path = path.reverse();

  rendered.breadcrumbs = path;

  rendered.siblings = tree.byId(articleInTree.parent).children.map(function(child) {
    return {
      title: child.title,
      url:   Article.getUrlBySlug(child.slug)
    };
  });

  return rendered;

}

