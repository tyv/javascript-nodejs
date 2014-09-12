var TagNode = require('./tagNode');
var inherits = require('inherits');

function ImgTag(attrs, isFigure) {
  TagNode.call(this, "img", "", attrs);
  this.isFigure = isFigure;
}
inherits(ImgTag, TagNode);

ImgTag.prototype.getType = function() {
  return "ImgTag";
};

module.exports = ImgTag;
