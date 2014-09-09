const TreeWalkerSync = require('javascript-parser').TreeWalkerSync;
const HeaderTag = require('javascript-parser').HeaderTag;
const CompositeTag = require('javascript-parser').CompositeTag;

function HeaderAnchorTransformer(node) {
  this.node = node;
}

HeaderAnchorTransformer.prototype.run = function* () {

  var treeWalker = new TreeWalkerSync(this.node);

  var self = this;
  treeWalker.walk(function(node) {
    if (!(node instanceof HeaderTag)) return;

    node.toHtml = function(options) {
      var headerContent = CompositeTag.prototype.toHtml.call(this, options);
      var anchor = this.anchor;

      return '<h' + this.level + '><a class="main__anchor" name="' + anchor + '" href="#' + anchor + '">' +
        headerContent +
        '</a></h' + this.level + '>';

    };
  });
};


module.exports = HeaderAnchorTransformer;
