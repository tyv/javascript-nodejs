var inherits = require('inherits');
var TagNode = require('./tagNode');

function KeyTag(text) {
  TagNode.call(this, "kbd", text, {"class": "shortcut"});
}
inherits(KeyTag, TagNode);

KeyTag.prototype.getType = function() {
  return "KeyTag";
};

module.exports = KeyTag;
