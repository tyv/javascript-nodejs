const mongoose = require('lib/mongoose');
const co = require('co');
const treeUtil = require('lib/treeUtil');

var Article = mongoose.models.Article;

co(function*() {
  var tree = yield Article.findTree();

  treeUtil.walkArray(tree, function(node) {
    if (!node.parent) {
      node.level = 1;
      node.path = (node.weight > 9 ? node.weight : '0' + node.weight) + '-' + node.slug;
      node.url = node.path + (node.isFolder ? '/index.md' : '/article.md');
    } else {
      node.level = tree.byId[node.parent].level + 1;
      node.path = tree.byId[node.parent].path + '/' + (node.weight > 9 ? node.weight : '0' + node.weight) + '-' + node.slug;
      node.url = node.path + (node.isFolder ? '/index.md' : '/article.md');
    }

  });

  var arr = treeUtil.flattenArray(tree);

  for (var i = 0; i < arr.length; i++) {
    var node = arr[i];
    console.log(new Array(node.level).join('  ') + '- [' + node.title + '](' + node.url + ')');
  }


})(function(err) {
  if (err) throw err;
});
