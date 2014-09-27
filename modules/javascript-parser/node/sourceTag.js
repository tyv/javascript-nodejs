var TagNode = require('./tagNode');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function SourceTag(name, text, attrs) {
  TagNode.call(this, 'pre', text, attrs);
  this.name = name;
}
inherits(SourceTag, TagNode);

SourceTag.prototype.getType = function() {
  return "SourceTag";
};

module.exports = SourceTag;
