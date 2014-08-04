const mongoose = require('mongoose');
const Article = require('../models/article');
const ArticleRenderer = require('../renderer/articleRenderer');
const treeUtil = require('lib/treeUtil');
const _ = require('lodash');

exports.get = function *get(next) {

  const article = yield Article.findOne({ slug: this.params.slug }).exec();
  if (!article) {
    yield next;
    return;
  }

  const renderer = new ArticleRenderer();
  const articleBody = yield renderer.render(article);

  const tree = yield Article.findTree();

  var prevNext = treeUtil.findPrevNextById(tree, article._id);

  var prev = prevNext.prev;
  if (prev) {
    prev.url = Article.getUrlBySlug(prev.slug);
  }

  var next = prevNext.next;
  if (next) {
    next.url = Article.getUrlBySlug(next.slug);
  }

  var locals = {
    title: article.title,
    content: articleBody,
    modified: article.modified,
    prev: prev,
    next: next
  };
  _.assign(this.locals, locals);

  this.body = this.render(__dirname, "article", locals);

};

