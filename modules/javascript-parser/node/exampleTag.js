var TagNode = require('./tagNode');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function ExampleTag(attrs) {
  TagNode.call(this, 'div', '', attrs);
}
inherits(ExampleTag, TagNode);

ExampleTag.prototype.getType = function() {
  return "ExampleTag";
};

module.exports = ExampleTag;
