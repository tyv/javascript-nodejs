const mongoose = require('mongoose');
const Article = mongoose.models.Article;
const ArticleRenderer = require('../renderer/articleRenderer').ArticleRenderer;
const treeUtil = require('lib/treeUtil');
const jade = require('jade');
const _ = require('lodash');

exports.get = function *get(next) {

  const article = yield Article.findOne({ slug: this.params[0] }).exec();
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

  this.render(__dirname, "article", locals);

  //yield this.render("/hmvc/tutorial/template/article", );


};

