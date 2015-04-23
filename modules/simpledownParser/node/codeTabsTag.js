var TagNode = require('./tagNode');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function CodeTabsTag(attrs) {
  TagNode.call(this, 'div', '', attrs);
}
inherits(CodeTabsTag, TagNode);

CodeTabsTag.prototype.getType = function() {
  return "CodeTabsTag";
};

module.exports = CodeTabsTag;
