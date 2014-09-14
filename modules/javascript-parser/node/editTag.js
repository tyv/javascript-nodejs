var inherits = require('inherits');
var TagNode = require('./tagNode');

function EditTag(body, attrs) {
  TagNode.call(this, 'a', body, attrs);
}
inherits(EditTag, TagNode);

EditTag.prototype.getType = function() {
  return "EditTag";
};

module.exports = EditTag;
