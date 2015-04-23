var TagNode = require('./tagNode');
var inherits = require('inherits');

function ImgTag(attrs, isFigure) {
  TagNode.call(this, "img", "", attrs);
  this.isFigure = isFigure;
  // img must have alt
  // @see http://www.w3.org/TR/html-markup/img.html
  if (!attrs.alt) attrs.alt = attrs.src;
}
inherits(ImgTag, TagNode);

ImgTag.prototype.getType = function() {
  return "ImgTag";
};

module.exports = ImgTag;
