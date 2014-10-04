var TagNode = require('./tagNode');
var inherits = require('inherits');

function IframeTag(attrs) {
  TagNode.call(this, "iframe", "", attrs);
}
inherits(IframeTag, TagNode);

IframeTag.prototype.getType = function() {
  return "IframeTag";
};

module.exports = IframeTag;
