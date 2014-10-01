var TagNode = require('./tagNode');
var inherits = require('inherits');

function ImgTag(attrs, isFigure) {
  TagNode.call(this, "img", "", attrs);
  this.isFigure = isFigure;
  if (!attrs.alt) attrs.alt = "";
}
inherits(ImgTag, TagNode);

ImgTag.prototype.getType = function() {
  return "ImgTag";
};

module.exports = ImgTag;
