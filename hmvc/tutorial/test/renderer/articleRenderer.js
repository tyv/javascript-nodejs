const app = require('app');

const ArticleRenderer = require('../../renderer/articleRenderer').ArticleRenderer;
const mongoose = require('lib/mongoose');
const Article = mongoose.models.Article;

describe("ArticleRenderer", function() {

  beforeEach(function* () {
    yield Article.destroy();
  });

  it("appens -2, -3... to header with same title", function* () {

    const article = new Article({
      title:   "Title",
      slug:    "test",
      content: "# Title\n\n## Title\n\nMy html *string*."
    });
    const renderer = new ArticleRenderer();

    const result = yield renderer.render(article);
    result.replace(/\n/g, '').should.be.eql(
      '<h2><a name="title-2" href="#title-2">Title</a></h2><p>My html <em>string</em>.</p>'
    );

  });

  it("resolves references to article", function* () {

    yield new Article({
      title:   "Title",
      slug:    "test",
      weight:  0,
      isFolder: false,
      content: "# Title\n\n## Title\n\nMy html *string*."
    }).persist();

    const article = new Article({
      title:   "Title",
      slug:    "test",
      weight:  0,
      isFolder: false,
      content: "# Title\n\n[](/test)"
    });

    const renderer = new ArticleRenderer();

    const result = yield renderer.render(article);
    result.replace(/\n/g, '').should.be.eql(
      '<p><a href="/test">Title</a></p>'
    );

  });
});
