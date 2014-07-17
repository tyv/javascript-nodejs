require('app');

var dataUtil = require('lib/dataUtil');
var mongoose = require('mongoose');
var assert = require('assert');
var path = require('path');
var treeUtil = require('lib/treeUtil');
var Article = mongoose.models.Article;


describe('Article', function() {

  before(function* () {
    yield dataUtil.loadDb(path.join(__dirname, '../data/article'));

  });


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
