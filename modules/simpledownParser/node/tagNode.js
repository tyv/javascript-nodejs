var TextNode = require('./textNode');
var inherits = require('inherits');

function TagNode(tag, text, attrs) {
  if (typeof text != "string") {
    throw new Error("Text must be string");
  }

  TextNode.call(this, text);
  this.tag = tag && tag.toLowerCase();
  this.attrs = attrs || {};
}
inherits(TagNode, TextNode);

TagNode.prototype.getType = function() {
  return "TagNode";
};

TagNode.prototype.toStructure = function(options) {
  var structure = TextNode.prototype.toStructure.call(this, options);
  structure.tag = this.tag;
  if (Object.keys(this.attrs).length) {
    structure.attrs = this.attrs;
  }
  return structure;
};


module.exports = TagNode;
