var data = require('test/data');
var mongoose = require('mongoose');
var co = require('co');

describe('Article', function() {
  before(function* () {
    yield data.createEmptyDb;
  });

  var Article = mongoose.models.Article;

  it('sets created & modified', function*() {
    var date = new Date();

    var article = new Article({
      title: "Title",
      slug: 'slug',
      content: "Content",
      weight: 0
    });

    yield article.persist();

    article.get('modified').should.be.greaterThan(date);
  });

});
