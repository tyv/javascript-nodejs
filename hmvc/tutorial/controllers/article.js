const mongoose = require('mongoose');
const Article = mongoose.models.Article;
const ArticleRenderer = require('../renderer/articleRenderer').ArticleRenderer;
const treeUtil = require('lib/treeUtil');
const jade = require('jade');
const thunkify = require('thunkify');
const _ = require('lodash');
const jadeParser = require('lib/jadeParser');

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

  var parser = jadeParser(__dirname);

  var locals = {
    title: article.title,
    content: articleBody,
    modified: article.modified,
    prev: prev,
    next: next,
    cache: false,
    parser: parser,
    deb: function() {
      //debugger;
    }
  };
  _.assign(this.locals, locals);

  this.body = jade.renderFile(parser.resolvePath("article"), this.locals);

  //yield this.render("/hmvc/tutorial/template/article", );


};

