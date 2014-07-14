var data = require('test/data');
var mongoose = require('mongoose');
var util = require('util');
var assert = require('assert');
var treeUtil = require('lib/treeUtil');

describe('Article', function() {

  before(function* () {
    yield data.loadDb('article');
  });

  var Article = mongoose.models.Article;

  it('sets created & modified', function*() {
    var date = new Date();

    var article = new Article({
      title: "Title",
      slug: 'slug',
      content: "Content",
      isFolder: false,
      weight: 0
    });

    yield article.persist();

    assert(article.modified >= date);

    yield article.destroy();
  });

  describe('findTree', function() {

    it("works", function* () {
      var tree = yield Article.findTree();
      console.log(treeUtil.flattenArray(tree));
//      console.log(util.inspect(tree, {depth:100}));
    });

  });

});
