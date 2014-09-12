var EscapedTag = require('./escapedTag');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function SourceTag(name, text, src, params) {
  EscapedTag.call(this, 'pre', text);
  this.name = name;
  this.src = src;
  this.params = params;
}
inherits(SourceTag, EscapedTag);

SourceTag.prototype.getType = function() {
  return "SourceTag";
};

SourceTag.prototype.isExternal = function() {
  return this.src && !this.isLoaded;
};

SourceTag.prototype.setTextFromSrc = function(text) {
  this.text = text;
  this.isLoaded = true;
};

module.exports = SourceTag;
