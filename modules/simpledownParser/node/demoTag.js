var inherits = require('inherits');
var TagNode = require('./tagNode');

function DemoTag(body, attrs) {
  TagNode.call(this, 'a', body, attrs);
}
inherits(DemoTag, TagNode);

DemoTag.prototype.getType = function() {
  return "DemoTag";
};

module.exports = DemoTag;
