var inherits = require('inherits');
var TextNode = require('./textNode');

// Текст, который нужно вернуть без обработки вложенных тегов,
// в виде профильтрованного HTML
function VerbatimText(text, noTypography) {
  TextNode.call(this, text);
  this.noTypography = noTypography;
}
inherits(VerbatimText, TextNode);

VerbatimText.prototype.getType = function() {
  return "VerbatimText";
};

module.exports = VerbatimText;

