const mongoose = require('mongoose');
const Article = mongoose.models.Article;
const ArticleRenderer = require('renderer/articleRenderer').ArticleRenderer;

exports.get = function *get(next) {
  console.log(this.params[0]);
  const article = yield Article.findOne({ slug: this.params[0] }).exec();

  if (!article) {
    yield next;
    return;
  }

  const renderer = new ArticleRenderer();
  const articleBody = yield renderer.render(article);

  this.response.body = articleBody;


};

