var TagNode = require('./tagNode');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function ExampleTag(src, attrs) {
  TagNode.call(this, 'div', '', attrs);
  this.src = src;
}
inherits(ExampleTag, TagNode);

ExampleTag.prototype.getType = function() {
  return "ExampleTag";
};

module.exports = ExampleTag;
